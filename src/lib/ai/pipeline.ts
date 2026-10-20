import "server-only";
import { config } from "@/lib/config";
import { getDb, schema } from "@/lib/db/client";
import type { AskContextTurn } from "@/lib/db/schema";
import { detectLanguages, type LanguageCode } from "@/lib/i18n/languages";
import { gatePassed } from "@/lib/i18n/readiness";
import { log } from "@/lib/log";
import { sha256 } from "@/lib/auth/crypto";
import { validateDraft, groundPoints, retrievalSufficient, type JudgeMap, type Validation } from "./checks";
import { getProvider, type LLMProvider } from "./llm";
import { ANSWER_SYSTEM, JUDGE_SYSTEM, UNDERSTAND_SYSTEM, answerUser, judgeUser, understandUser } from "./prompts";
import { retrieve } from "./retrieval";
import { classifySensitivity, maxRisk } from "./sensitivity";
import {
  AnswerDraftSchema,
  type AnswerDraft,
  JudgeSchema,
  UnderstandingSchema,
  type AbstainReason,
  type AskResult,
  type CheckResult,
  type Outcome,
  type Passage,
  type Risk,
  type RetrievalOutcome,
} from "./types";

export type Stage = "understanding" | "retrieving" | "composing" | "checking";

export type AskInput = {
  question: string;
  lang: LanguageCode;
  context: AskContextTurn[];
  /** Title of the story/connection the question was asked from, to focus retrieval. */
  focus?: string;
  onStage?: (s: Stage) => void;
};

export type AskOutput = { result: AskResult; contextTurn: AskContextTurn | null };

export function validateQuestion(q: unknown): { ok: true; question: string } | { ok: false; error: "too_short" | "too_long" } {
  const question = typeof q === "string" ? q.replace(/\s+/g, " ").trim() : "";
  if (question.length < 3) return { ok: false, error: "too_short" };
  if (question.length > 500) return { ok: false, error: "too_long" };
  return { ok: true, question };
}

function thresholds() {
  const a = config().ai;
  return { minPassages: a.minPassages, minPassageScore: a.minPassageScore, minCoverage: a.minCoverage, abstainBelowCoverage: a.abstainBelowCoverage, minScriptRatio: a.minScriptRatio };
}

export async function runAsk(input: AskInput): Promise<AskOutput> {
  const started = Date.now();
  const llm = getProvider();
  const stage = (s: Stage) => input.onStage?.(s);
  const checks: CheckResult[] = [];
  const detected = detectLanguages(input.question);

  // 1. Understand: scope, risk, standalone question, search queries.
  stage("understanding");
  const det = classifySensitivity(`${input.question}`);
  let risk: Risk = det.risk;
  let inScope = true;
  let standalone = input.question;
  let queryEn = input.question;
  let queryNative = input.question;
  if (llm) {
    const u = await llm.generate({ task: "understand", system: UNDERSTAND_SYSTEM, user: understandUser(input.question, input.lang, input.context), schema: UnderstandingSchema });
    if (u.ok) {
      risk = maxRisk(risk, u.data.risk); // the model can raise, never lower, the deterministic risk
      inScope = u.data.in_scope;
      standalone = u.data.standalone_question || input.question;
      queryEn = u.data.search_query_en || input.question;
      queryNative = u.data.search_query_native || queryEn;
      checks.push({ id: "query_understanding", mandatory: false, status: "pass" });
    } else {
      checks.push({ id: "query_understanding", mandatory: false, status: "indeterminate", detail: u.error });
    }
  } else {
    // Without a model, a follow-up is searched together with the previous question.
    const prev = input.context.at(-1)?.q;
    if (prev && input.question.split(" ").length < 6) queryEn = queryNative = `${prev} ${input.question}`;
  }
  if (input.focus) {
    queryEn = `${input.focus} ${queryEn}`;
    queryNative = `${input.focus} ${queryNative}`;
  }
  checks.push({ id: "sensitivity_classification", mandatory: true, status: "pass", detail: [risk, ...det.categories].join(",") });

  const finish = (outcome: Outcome, extra: Partial<AskResult> & { abstainReason?: AbstainReason }, retrieval?: RetrievalOutcome, v?: Validation, cover?: number) =>
    finalize({ input, llm, risk, outcome, extra, retrieval, validation: v, checks, started, standalone, detected, coverage: cover });

  if (risk === "high_risk") return finish("abstained", { abstainReason: "sensitive" });
  if (!inScope) return finish("abstained", { abstainReason: "out_of_scope" });

  // 2. Retrieve.
  stage("retrieving");
  const retrieval = await retrieve({ queryEn, queryNative, lang: input.lang });
  const allFailed = retrieval.providersTried.length > 0 && retrieval.providersFailed.length === retrieval.providersTried.length;
  if (retrieval.passages.length === 0 && allFailed) return finish("failed", { abstainReason: "retrieval_failed" }, retrieval);

  // No model configured: show the evidence itself, clearly labelled — never a simulated answer.
  // The same sufficiency threshold applies, so weakly related passages are not presented as evidence.
  if (!llm) {
    if (!retrievalSufficient(retrieval.passages, thresholds())) return finish("abstained", { abstainReason: "insufficient_evidence" }, retrieval);
    const relevant = { ...retrieval, passages: retrieval.passages.filter((p) => p.score >= thresholds().minPassageScore) };
    return finish("evidence_only", {}, relevant);
  }

  if (!retrievalSufficient(retrieval.passages, thresholds())) {
    checks.push({ id: "retrieval_sufficiency", mandatory: true, status: "fail" });
    return finish("abstained", { abstainReason: "insufficient_evidence" }, retrieval);
  }

  // 3. Compose.
  stage("composing");
  const gen = await llm.generate({
    task: "answer",
    system: ANSWER_SYSTEM,
    user: answerUser(standalone, input.lang, retrieval.passages, input.context, risk),
    schema: AnswerDraftSchema,
  });
  if (!gen.ok) {
    checks.push({ id: "generation", mandatory: true, status: "fail", detail: gen.error });
    if (gen.error === "refusal") return finish("abstained", { abstainReason: "sensitive" }, retrieval);
    return finish("failed", { abstainReason: "provider_failed" }, retrieval);
  }

  // 4. Check.
  stage("checking");
  const judge = config().ai.judge ? await runJudge(llm, gen.data, retrieval.passages) : ("disabled" as const);
  const v = validateDraft({
    draft: gen.data,
    passages: retrieval.passages,
    lang: input.lang,
    risk,
    languageGatePassed: gatePassed(input.lang),
    judge,
    t: thresholds(),
  });
  checks.push(...v.checks);
  return finish(v.outcome, { abstainReason: v.abstainReason, followUps: gen.data.follow_up_questions.slice(0, 3) }, retrieval, v, v.coverage);
}

async function runJudge(llm: LLMProvider, draft: AnswerDraft, passages: Passage[]): Promise<JudgeMap> {
  const byId = new Map(passages.map((p) => [p.id, p.text]));
  const items = groundPoints(draft, passages)
    .filter((g) => g.citationsValid && g.grounded.length)
    .map((g) => ({ id: g.key, text: g.point.text, evidence: g.point.citations.map((c) => byId.get(c)!).filter(Boolean) }));
  if (draft.summary.trim()) items.push({ id: "SUM", text: draft.summary, evidence: draft.summary_citations.map((c) => byId.get(c)).filter((x): x is string => !!x) });
  draft.perspectives.forEach((p, i) => items.push({ id: `V${i + 1}`, text: `${p.label}: ${p.text}`, evidence: p.citations.map((c) => byId.get(c)).filter((x): x is string => !!x) }));
  if (!items.length) return new Map();
  const r = await llm.generate({ task: "judge", system: JUDGE_SYSTEM, user: judgeUser(items), schema: JudgeSchema });
  if (!r.ok) return "unavailable";
  return new Map(r.data.verdicts.map((v) => [v.point, v.supported]));
}

async function finalize(a: {
  input: AskInput;
  llm: LLMProvider | null;
  risk: Risk;
  outcome: Outcome;
  extra: Partial<AskResult> & { abstainReason?: AbstainReason };
  retrieval?: RetrievalOutcome;
  validation?: Validation;
  checks: CheckResult[];
  started: number;
  standalone: string;
  detected: string[];
  coverage?: number;
}): Promise<AskOutput> {
  const { input, validation: v, retrieval } = a;
  const passages = retrieval?.passages ?? [];
  const byId = new Map(passages.map((p) => [p.id, p]));

  // Number only the sources that actually support shown statements.
  const order: string[] = [];
  const use = (id: string) => {
    if (byId.has(id) && !order.includes(id)) order.push(id);
  };
  const shown = a.outcome === "routine_approved" || a.outcome === "qualified";
  if (shown && v) {
    v.summaryCitations.forEach(use);
    v.sections.forEach((s) => s.points.forEach((p) => p.supportedBy.forEach(use)));
    v.perspectives.forEach((p) => p.citations.forEach(use));
  }
  const sourceNumber = new Map<string, number>();
  const sources: AskResult["sources"] = [];
  for (const pid of order) {
    const p = byId.get(pid)!;
    let entry = sources.find((s) => s.key === p.source.key);
    if (!entry) {
      entry = { ...p.source, n: sources.length + 1, quotes: [] };
      sources.push(entry);
    }
    sourceNumber.set(pid, entry.n);
  }
  if (shown && v) {
    for (const s of v.sections)
      for (const p of s.points)
        for (const q of p.quotes) {
          const n = sourceNumber.get(q.passage);
          const entry = sources.find((x) => x.n === n);
          if (entry && p.supportedBy.includes(q.passage) && !entry.quotes.includes(q.quote) && entry.quotes.length < 3) entry.quotes.push(q.quote);
        }
  }
  const nums = (ids: string[]) => [...new Set(ids.map((i) => sourceNumber.get(i)).filter((n): n is number => !!n))];

  // Next discoveries: only published TattvaCo items that were actually retrieved for this question.
  const seen = new Set<string>();
  const nextDiscoveries: AskResult["nextDiscoveries"] = [];
  const preferred = [...order.map((id) => byId.get(id)!), ...passages];
  for (const p of preferred) {
    const i = p.source.internal;
    if (!i || seen.has(`${i.kind}:${i.slug}`) || nextDiscoveries.length >= 3) continue;
    seen.add(`${i.kind}:${i.slug}`);
    nextDiscoveries.push({ kind: i.kind, slug: i.slug, title: p.source.title.replace(/^TattvaCo (story|connection): /, ""), isFixture: i.isFixture });
  }

  const foundSources =
    a.outcome === "evidence_only" || a.outcome === "abstained"
      ? passages.slice(0, 5).map((p) => ({ ...p.source, excerpt: p.text.slice(0, 600) }))
      : [];

  const result: AskResult = {
    runId: "",
    outcome: a.outcome,
    abstainReason: a.extra.abstainReason,
    risk: a.risk,
    language: input.lang,
    languageValidated: gatePassed(input.lang),
    detectedLanguage: a.detected.length && !a.detected.includes(input.lang) ? a.detected[0] : undefined,
    summary: shown && v ? v.summary : null,
    summarySources: shown && v && v.summary ? nums(v.summaryCitations) : [],
    sections: shown && v ? v.sections.map((s) => ({ heading: s.heading, points: s.points.map((p) => ({ text: p.text, epistemic: p.epistemic, sources: nums(p.supportedBy) })) })) : [],
    perspectives: shown && v ? v.perspectives.map((p) => ({ label: p.label, text: p.text, sources: nums(p.citations) })) : [],
    limitations: shown && v ? v.limitations : [],
    followUps: a.extra.followUps ?? [],
    sources,
    foundSources,
    failedChecks: a.checks.filter((c) => c.mandatory && c.status !== "pass" && c.status !== "not_applicable").map((c) => ({ id: c.id, status: c.status })),
    retrievalIssues: retrieval?.providersFailed ?? [],
    nextDiscoveries,
  };

  // Audit record: check outcomes without question text or account identifiers (FR-12).
  try {
    const db = await getDb();
    const [row] = await db
      .insert(schema.answerRuns)
      .values({
        language: input.lang,
        risk: a.risk,
        outcome: a.outcome,
        checks: a.checks,
        provider: a.llm?.name ?? "none",
        model: a.llm?.model ?? null,
        retrievalProviders: retrieval?.providersTried ?? [],
        sourceRefs: passages.map((p) => ({ id: p.id, url: p.source.url })),
        coverage: a.coverage ?? null,
        latencyMs: Date.now() - a.started,
      })
      .returning({ id: schema.answerRuns.id });
    result.runId = row.id;
  } catch (err) {
    log.error("answer_run.persist_failed", { error: (err as Error).name });
    result.runId = sha256(`${Date.now()}${Math.random()}`).slice(0, 32);
  }
  log.info("ask.completed", { outcome: a.outcome, risk: a.risk, lang: input.lang, ms: Date.now() - a.started, passages: passages.length });

  const contextTurn = shown ? { q: a.standalone.slice(0, 300), a: (result.summary ?? result.sections[0]?.points[0]?.text ?? "").slice(0, 400), lang: input.lang } : null;
  return { result, contextTurn };
}
