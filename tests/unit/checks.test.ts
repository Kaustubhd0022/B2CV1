import { describe, expect, it } from "vitest";
import { validateDraft, type JudgeMap } from "@/lib/ai/checks";
import type { AnswerDraft, Passage } from "@/lib/ai/types";

const T = { minPassages: 2, minPassageScore: 0.15, minCoverage: 0.8, abstainBelowCoverage: 0.5, minScriptRatio: 0.6 };

const src = (key: string) => ({ key, title: key, publisher: "Test", url: `https://example.org/${key}`, language: "en", sourceType: "reference" as const, tier: 2 as const });
const passages: Passage[] = [
  { id: "P1", text: "Hampi was the capital of the Vijayanagara Empire from 1336 to 1565, when it was abandoned.", score: 0.9, provider: "corpus", source: src("a") },
  { id: "P2", text: "According to legend, Brahma performed ten Ashwamedha sacrifices at this ghat.", score: 0.6, provider: "corpus", source: src("b") },
  { id: "P3", text: "Some historians say the nets came from China; others say they arrived with Portuguese traders.", score: 0.5, provider: "wikipedia", source: src("c") },
];

const point = (text: string, citations: string[], quotes: [string, string][], epistemic: AnswerDraft["sections"][0]["points"][0]["epistemic"] = "documented") => ({
  text,
  epistemic,
  citations,
  quotes: quotes.map(([passage, quote]) => ({ passage, quote })),
});

const draft = (over: Partial<AnswerDraft> = {}): AnswerDraft => ({
  status: "answered",
  summary: "Hampi was the Vijayanagara capital until 1565.",
  summary_citations: ["P1"],
  sections: [{ heading: "History", points: [point("Hampi was the capital from 1336 to 1565.", ["P1"], [["P1", "capital of the Vijayanagara Empire from 1336 to 1565"]])] }],
  perspectives: [],
  conflict_detected: false,
  limitations: [],
  follow_up_questions: [],
  ...over,
});

const yesJudge = (keys: string[]): JudgeMap => new Map(keys.map((k) => [k, "yes" as const]));
const run = (d: AnswerDraft, extra: Partial<Parameters<typeof validateDraft>[0]> = {}) =>
  validateDraft({ draft: d, passages, lang: "en", risk: "routine", languageGatePassed: true, judge: yesJudge(["S1.1", "S1.2", "S1.3", "SUM", "V1", "V2"]), t: T, ...extra });
const status = (v: ReturnType<typeof run>, id: string) => v.checks.find((c) => c.id === id)?.status;

describe("validateDraft — fail-closed answer checks", () => {
  it("routine-approves only when every mandatory check passes", () => {
    const v = run(draft());
    expect(v.outcome).toBe("routine_approved");
    expect(v.sections[0].points).toHaveLength(1);
    expect(v.summary).not.toBeNull();
  });

  it("removes points whose quote is not verbatim in the cited passage (fabricated quote)", () => {
    const d = draft({
      sections: [
        {
          heading: "History",
          points: [
            point("Hampi was the capital from 1336 to 1565.", ["P1"], [["P1", "capital of the Vijayanagara Empire from 1336 to 1565"]]),
            point("Hampi had a million residents.", ["P1"], [["P1", "Hampi had a population of one million people"]]),
          ],
        },
      ],
    });
    const v = run(d);
    expect(v.sections[0].points.map((p) => p.text)).toEqual(["Hampi was the capital from 1336 to 1565."]);
    expect(status(v, "quote_grounding")).toBe("fail");
    expect(v.outcome).not.toBe("routine_approved");
  });

  it("rejects citations to passages that were never retrieved", () => {
    const d = draft({ sections: [{ heading: "x", points: [point("Claim.", ["P9"], [["P9", "capital of the Vijayanagara Empire from 1336 to 1565"]])] }] });
    const v = run(d);
    expect(status(v, "citation_existence")).toBe("fail");
    expect(v.outcome).toBe("abstained");
    expect(v.abstainReason).toBe("insufficient_evidence");
  });

  it("does not accept a quote that exists only in a passage the point does not cite", () => {
    const d = draft({ sections: [{ heading: "x", points: [point("Capital dates.", ["P2"], [["P1", "capital of the Vijayanagara Empire from 1336 to 1565"]])] }] });
    expect(run(d).sections).toHaveLength(0);
  });

  it("relabels legend-based points marked 'documented' as tradition and blocks auto-approval", () => {
    const d = draft({
      summary_citations: ["P2"],
      summary: "Legend links the ghat to Brahma.",
      sections: [{ heading: "Ritual", points: [point("Brahma performed ten sacrifices here.", ["P2"], [["P2", "According to legend, Brahma performed ten Ashwamedha sacrifices"]], "documented")] }],
    });
    const v = run(d);
    expect(v.sections[0].points[0].epistemic).toBe("tradition");
    expect(status(v, "epistemic_consistency")).toBe("fail");
    expect(v.outcome).toBe("qualified");
  });

  it("requires attributed perspectives when sources conflict", () => {
    const d = draft({ conflict_detected: true, perspectives: [{ label: "Chinese origin", text: "Some say China.", citations: ["P3"] }] });
    expect(status(run(d), "conflict_handling")).toBe("fail");
    const ok = draft({
      conflict_detected: true,
      perspectives: [
        { label: "Chinese origin", text: "Some say China.", citations: ["P3"] },
        { label: "Portuguese", text: "Others say Portuguese traders.", citations: ["P3"] },
      ],
    });
    expect(status(run(ok), "conflict_handling")).toBe("pass");
  });

  it("treats an unavailable judge as indeterminate — never as a pass", () => {
    const v = run(draft(), { judge: "unavailable" });
    expect(status(v, "claim_support_judge")).toBe("indeterminate");
    expect(v.outcome).toBe("qualified");
  });

  it("removes points the judge rejects, and drops an unsupported summary", () => {
    const judge: JudgeMap = new Map([
      ["S1.1", "no"],
      ["SUM", "no"],
    ]);
    const v = run(draft(), { judge });
    expect(v.sections).toHaveLength(0);
    expect(v.summary).toBeNull();
    expect(v.outcome).toBe("abstained");
  });

  it("never routine-approves when the language quality gate has not passed", () => {
    const v = run(draft(), { languageGatePassed: false });
    expect(status(v, "language_quality_gate")).toBe("indeterminate");
    expect(v.outcome).toBe("qualified");
  });

  it("fails the script check when the answer is not in the selected language", () => {
    const v = run(draft(), { lang: "hi" });
    expect(status(v, "language_script")).toBe("fail");
  });

  it("applies stricter handling to sensitive topics and abstains on high-risk ones", () => {
    expect(run(draft(), { risk: "sensitive" }).outcome).toBe("abstained"); // no perspectives, no limits
    expect(run(draft({ limitations: ["Few sources."] }), { risk: "sensitive" }).outcome).toBe("qualified");
    const hr = run(draft(), { risk: "high_risk" });
    expect(hr.outcome).toBe("abstained");
    expect(hr.abstainReason).toBe("sensitive");
  });

  it("abstains when the model reports insufficient evidence or retrieval is thin", () => {
    expect(run(draft({ status: "insufficient_evidence" })).outcome).toBe("abstained");
    const thin = validateDraft({ draft: draft(), passages: [passages[0]], lang: "en", risk: "routine", languageGatePassed: true, judge: "disabled", t: T });
    expect(thin.outcome).toBe("abstained");
    expect(thin.checks.find((c) => c.id === "retrieval_sufficiency")?.status).toBe("fail");
  });

  it("flags URLs in model text as possible fabricated links", () => {
    const d = draft({ summary: "See https://made-up.example for details. Hampi was the capital." });
    expect(status(run(d), "no_fabricated_links")).toBe("fail");
  });

  it("requires limitations when hedged points are shown", () => {
    const d = draft({ sections: [{ heading: "x", points: [point("Capital dates.", ["P1"], [["P1", "capital of the Vijayanagara Empire from 1336 to 1565"]], "uncertain")] }] });
    expect(status(run(d), "uncertainty_communication")).toBe("fail");
  });
});
