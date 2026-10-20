import { scriptRatio, languageInfo } from "@/lib/i18n/languages";
import { hasUrl, quoteInPassage } from "./text";
import type { AbstainReason, AnswerDraft, CheckResult, CheckStatus, Outcome, Passage, Risk } from "./types";

/**
 * Runtime answer checks (PRD §9.3, Appendix B; IA §2 fail-closed rule).
 * Deterministic: model self-assessment is never the sole proof. An optional model-based
 * claim-support judge can only REMOVE points, never add or approve them.
 *
 * Fail-closed: an answer is "routine_approved" only if every mandatory check is "pass"
 * (or "not_applicable"). Any "fail" or "indeterminate" mandatory check → qualified or abstained.
 */

export type Thresholds = {
  minPassages: number;
  minPassageScore: number;
  minCoverage: number;
  abstainBelowCoverage: number;
  minScriptRatio: number;
};

export type JudgeMap = Map<string, "yes" | "partly" | "no"> | "unavailable" | "disabled";

type Point = AnswerDraft["sections"][number]["points"][number];
export type RetainedPoint = Point & { key: string; supportedBy: string[] };

export type Validation = {
  checks: CheckResult[];
  outcome: Outcome;
  abstainReason?: AbstainReason;
  sections: { heading: string; points: RetainedPoint[] }[];
  perspectives: AnswerDraft["perspectives"];
  summaryCitations: string[];
  /** Null when the summary could not be verified; points are still shown. */
  summary: string | null;
  coverage: number;
  limitations: string[];
};

const BELIEF_MARKERS = /\b(legend|legends|myth|myths|mytholog\w*|believed|believe|belief|according to tradition|traditionally|said to|devotees|puranic|scriptures?)\b/i;

export function retrievalSufficient(passages: Passage[], t: Thresholds) {
  return passages.filter((p) => p.score >= t.minPassageScore).length >= t.minPassages;
}

/** Points eligible for judging, keyed, after deterministic grounding. */
export function groundPoints(draft: AnswerDraft, passages: Passage[]) {
  const byId = new Map(passages.map((p) => [p.id, p]));
  const all: { section: number; key: string; point: Point; citationsValid: boolean; grounded: string[] }[] = [];
  draft.sections.forEach((s, si) =>
    s.points.forEach((p, pi) => {
      const citationsValid = p.citations.length > 0 && p.citations.every((c) => byId.has(c));
      // A quote counts only if it is verbatim in a passage the point actually cites.
      const grounded = [
        ...new Set(
          p.quotes.filter((q) => p.citations.includes(q.passage) && byId.has(q.passage) && quoteInPassage(q.quote, byId.get(q.passage)!.text)).map((q) => q.passage),
        ),
      ];
      all.push({ section: si, key: `S${si + 1}.${pi + 1}`, point: p, citationsValid, grounded });
    }),
  );
  return all;
}

export function validateDraft(input: {
  draft: AnswerDraft;
  passages: Passage[];
  lang: string;
  risk: Risk;
  languageGatePassed: boolean;
  judge: JudgeMap;
  t: Thresholds;
}): Validation {
  const { draft, passages, lang, risk, t } = input;
  const ids = new Set(passages.map((p) => p.id));
  const checks: CheckResult[] = [];
  const add = (id: string, status: CheckStatus, detail?: string, mandatory = true) => checks.push({ id, mandatory, status, detail });

  add("retrieval_sufficiency", retrievalSufficient(passages, t) ? "pass" : "fail", `${passages.length} passages`);

  const grounded = groundPoints(draft, passages);
  const total = grounded.length;
  const invalidCitations = grounded.filter((g) => !g.citationsValid).length;
  add("citation_existence", total === 0 ? "indeterminate" : invalidCitations === 0 ? "pass" : "fail", `${invalidCitations}/${total} points cite unknown passages`);

  const ungrounded = grounded.filter((g) => g.grounded.length === 0).length;
  add("quote_grounding", total === 0 ? "indeterminate" : ungrounded === 0 ? "pass" : "fail", `${ungrounded}/${total} points without a verbatim quote`);

  // Claim-support judge (optional; can only remove points).
  let judged = grounded.filter((g) => g.citationsValid && g.grounded.length > 0);
  if (input.judge === "disabled") add("claim_support_judge", "not_applicable", "disabled", false);
  else if (input.judge === "unavailable") add("claim_support_judge", "indeterminate", "judge unavailable");
  else {
    const verdicts = input.judge;
    const rejected = judged.filter((g) => verdicts.get(g.key) === "no" || !verdicts.has(g.key));
    judged = judged.filter((g) => verdicts.get(g.key) === "yes" || verdicts.get(g.key) === "partly");
    add("claim_support_judge", rejected.length === 0 ? "pass" : "fail", `${rejected.length} points not supported`);
  }

  const supported = judged.length;
  const coverage = total === 0 ? 0 : supported / total;
  add("evidence_coverage", total === 0 ? "indeterminate" : coverage >= t.minCoverage ? "pass" : "fail", `coverage ${coverage.toFixed(2)}`);

  // Epistemic consistency: belief/legend evidence must not be labelled "documented".
  let relabelled = 0;
  const retained: RetainedPoint[][] = draft.sections.map(() => []);
  for (const g of judged) {
    const quotes = g.point.quotes.map((q) => q.quote).join(" ");
    let epistemic = g.point.epistemic;
    if (epistemic === "documented" && BELIEF_MARKERS.test(quotes)) {
      epistemic = "tradition";
      relabelled++;
    }
    retained[g.section].push({ ...g.point, epistemic, key: g.key, citations: g.point.citations.filter((c) => ids.has(c)), supportedBy: g.grounded });
  }
  add("epistemic_consistency", relabelled === 0 ? "pass" : "fail", `${relabelled} points relabelled as tradition`);

  const summaryCitations = draft.summary_citations.filter((c) => ids.has(c));
  const supportedIds = new Set(retained.flat().flatMap((p) => p.supportedBy));
  // The judge (when on) also verifies the summary ("SUM") and perspectives ("V1"…).
  const judgeSays = (key: string) => (input.judge instanceof Map ? input.judge.get(key) : "yes");
  const summaryOk =
    draft.summary.trim().length > 0 &&
    summaryCitations.length > 0 &&
    summaryCitations.every((c) => supportedIds.has(c)) &&
    judgeSays("SUM") !== "no" &&
    judgeSays("SUM") !== undefined;
  add("summary_support", summaryOk ? "pass" : "fail", "summary must cite passages that ground retained points");

  const perspectives = draft.perspectives.filter(
    (p, i) => p.citations.length > 0 && p.citations.every((c) => ids.has(c)) && judgeSays(`V${i + 1}`) !== "no" && judgeSays(`V${i + 1}`) !== undefined,
  );
  add(
    "conflict_handling",
    !draft.conflict_detected ? "pass" : perspectives.length >= 2 ? "pass" : "fail",
    draft.conflict_detected ? `${perspectives.length} attributed perspectives` : "no conflict reported",
  );

  const hedged = retained.flat().some((p) => p.epistemic === "contested" || p.epistemic === "uncertain");
  const limitations = draft.limitations.filter((l) => l.trim());
  add("uncertainty_communication", (hedged || coverage < 1) && limitations.length === 0 ? "fail" : "pass");

  add("sensitivity", risk === "routine" ? "pass" : "fail", `risk ${risk}: stricter handling`);

  const text = [draft.summary, ...retained.flat().map((p) => p.text)].join(" ");
  const ratio = scriptRatio(text, languageInfo(lang).script);
  add("language_script", ratio >= t.minScriptRatio ? "pass" : "fail", `script ratio ${ratio.toFixed(2)}`);
  add("language_quality_gate", input.languageGatePassed ? "pass" : "indeterminate", input.languageGatePassed ? undefined : "language has not passed the quality gate");

  add("no_fabricated_links", hasUrl(text) || draft.perspectives.some((p) => hasUrl(p.text)) ? "fail" : "pass");
  add("completeness", supported > 0 && draft.summary.trim().length > 0 ? "pass" : "fail");

  // ---------- Outcome policy ----------
  const sections = draft.sections.map((s, i) => ({ heading: s.heading, points: retained[i] })).filter((s) => s.points.length);
  const base = { checks, sections, perspectives, summaryCitations, summary: summaryOk ? draft.summary : null, coverage, limitations };

  if (risk === "high_risk") return { ...base, outcome: "abstained", abstainReason: "sensitive" };
  if (draft.status === "insufficient_evidence" || supported === 0 || coverage < t.abstainBelowCoverage || !retrievalSufficient(passages, t)) {
    return { ...base, outcome: "abstained", abstainReason: "insufficient_evidence" };
  }
  // Sensitive topics: shown only with attributed perspectives or explicit limits.
  if (risk === "sensitive" && perspectives.length === 0 && limitations.length === 0) {
    return { ...base, outcome: "abstained", abstainReason: "sensitive" };
  }
  const allPass = checks.filter((c) => c.mandatory).every((c) => c.status === "pass" || c.status === "not_applicable");
  return { ...base, outcome: allPass ? "routine_approved" : "qualified" };
}
