/**
 * TattvaCo answer evaluation cases (PRD §13.4). Reviewable and editable.
 *
 * Each case has:
 *  - a question and language,
 *  - `expect`: the acceptable outcome(s) and checks — QUALITY criteria, not formatting,
 *  - `script`: a deterministic model behaviour used by the automated test
 *    (tests/integration/ask-pipeline.test.ts) to exercise the validation pipeline.
 *
 * `npm run eval` runs the same questions against the LIVE configured model and grades
 * only `expect` (the script is ignored). Passing these cases does not prove factual
 * correctness; human audit of citations remains required (PRD §13.2).
 */
import type { AbstainReason, Outcome } from "@/lib/ai/types";

export type Draft = Record<string, unknown>;
export type ScriptCtx = { cite: (snippet: string) => { id: string; quote: string } | null; passages: { id: string; text: string }[] };

export type EvalCase = {
  id: string;
  category:
    | "supported"
    | "insufficient"
    | "conflicting"
    | "fabricated_citation"
    | "unsupported_claim"
    | "sensitive"
    | "high_risk"
    | "out_of_scope"
    | "multilingual"
    | "retrieval_failure"
    | "provider_failure"
    | "malformed_input";
  question: string;
  lang: string;
  expect: {
    outcomes: Outcome[];
    abstainReason?: AbstainReason;
    failedChecksInclude?: string[];
    minSources?: number;
    /** Text that must not appear in any shown statement (e.g. a fabricated claim). */
    mustNotShow?: string[];
  };
  /** Live-eval expectations when they differ from the scripted ones (models vary). */
  liveExpect?: { outcomes: Outcome[] };
  script?: {
    understand?: Draft | { __error: string };
    answer?: (ctx: ScriptCtx) => Draft | { __error: string };
    judge?: "all_yes" | { __error: string };
  };
  env?: Record<string, string>;
};

const understand = (q: string, risk = "routine", inScope = true) => ({
  in_scope: inScope,
  risk,
  risk_reason: "test",
  standalone_question: q,
  search_query_en: q,
  search_query_native: q,
});

const pt = (text: string, epistemic: string, c: { id: string; quote: string } | null) => ({
  text,
  epistemic,
  citations: c ? [c.id] : ["P99"],
  quotes: c ? [{ passage: c.id, quote: c.quote }] : [],
});

const answer = (summary: string, cites: ({ id: string; quote: string } | null)[], points: ReturnType<typeof pt>[], extra: Draft = {}) => ({
  status: "answered",
  summary,
  summary_citations: cites.filter(Boolean).map((c) => c!.id),
  sections: [{ heading: "Context", points }],
  perspectives: [],
  conflict_detected: false,
  limitations: [],
  follow_up_questions: ["What is the Samrat Yantra?"],
  ...extra,
});

export const CASES: EvalCase[] = [
  {
    id: "supported-jantar-mantar",
    category: "supported",
    question: "When was the Jantar Mantar observatory in Jaipur completed?",
    lang: "en",
    expect: { outcomes: ["routine_approved"], minSources: 1 },
    liveExpect: { outcomes: ["routine_approved", "qualified"] },
    env: { QUALITY_GATE_PASSED_LANGUAGES: "en" },
    script: {
      understand: understand("When was the Jantar Mantar observatory in Jaipur completed?"),
      answer: ({ cite }) => {
        const c = cite("The monument was completed in 1734");
        return answer("The Jaipur Jantar Mantar was completed in 1734.", [c], [pt("The Jaipur observatory, built by Sawai Jai Singh, was completed in 1734.", "documented", c)]);
      },
      judge: "all_yes",
    },
  },
  {
    id: "supported-but-language-gate-not-passed",
    category: "supported",
    question: "Why was the Jantar Mantar in Jaipur built?",
    lang: "en",
    expect: { outcomes: ["qualified"], failedChecksInclude: ["language_quality_gate"] },
    liveExpect: { outcomes: ["qualified"] },
    script: {
      understand: understand("Why was the Jantar Mantar in Jaipur built?"),
      answer: ({ cite }) => {
        const c = cite("in order to create a more accurate Zij");
        return answer("It was built to produce more accurate astronomical tables.", [c], [pt("Jai Singh built observatories to create more accurate astronomical tables.", "documented", c)]);
      },
      judge: "all_yes",
    },
  },
  {
    id: "insufficient-model-declines",
    category: "insufficient",
    question: "What exact dishes were served in Hampi's royal kitchens in 1520?",
    lang: "en",
    expect: { outcomes: ["abstained"], abstainReason: "insufficient_evidence" },
    script: {
      understand: understand("What exact dishes were served in Hampi's royal kitchens in 1520?"),
      answer: () => ({ ...answer("", [], []), status: "insufficient_evidence", sections: [], summary: "The sources do not describe royal menus." }),
      judge: "all_yes",
    },
  },
  {
    id: "insufficient-no-retrieval-matches",
    category: "insufficient",
    question: "Describe the Hornbill festival of Nagaland in detail.",
    lang: "en",
    expect: { outcomes: ["abstained"], abstainReason: "insufficient_evidence" },
    liveExpect: { outcomes: ["abstained", "qualified", "routine_approved"] },
    script: { understand: understand("Describe the Hornbill festival of Nagaland in detail.") },
  },
  {
    id: "fabricated-citation-removed",
    category: "fabricated_citation",
    question: "How many astronomical instruments are at Jantar Mantar in Jaipur?",
    lang: "en",
    expect: { outcomes: ["qualified", "abstained"], failedChecksInclude: ["quote_grounding"], mustNotShow: ["built by aliens"] },
    env: { QUALITY_GATE_PASSED_LANGUAGES: "en" },
    script: {
      understand: understand("How many astronomical instruments are at Jantar Mantar in Jaipur?"),
      answer: ({ cite, passages }) => {
        const c = cite("collection of 19 astronomical instruments");
        const fake = { id: passages[0].id, quote: "The instruments were built by aliens in 1200 CE according to records" };
        return answer("There are 19 instruments.", [c], [
          pt("Jantar Mantar in Jaipur has 19 astronomical instruments.", "documented", c),
          pt("The instruments were built by aliens.", "documented", fake),
        ]);
      },
      judge: "all_yes",
    },
  },
  {
    id: "unsupported-claim-invalid-passage-id",
    category: "unsupported_claim",
    question: "Who rebuilt the Meenakshi Temple after its destruction?",
    lang: "en",
    expect: { outcomes: ["qualified", "abstained"], failedChecksInclude: ["citation_existence"], mustNotShow: ["King Ashoka"] },
    env: { QUALITY_GATE_PASSED_LANGUAGES: "en" },
    script: {
      understand: understand("Who rebuilt the Meenakshi Temple after its destruction?"),
      answer: ({ cite }) => {
        const c = cite("rebuilt by the Vijayanagara Empire");
        return answer("The Vijayanagara Empire rebuilt it.", [c], [
          pt("It was rebuilt by the Vijayanagara Empire in the 14th century.", "documented", c),
          pt("King Ashoka personally designed the gopurams.", "documented", null),
        ]);
      },
      judge: "all_yes",
    },
  },
  {
    id: "conflicting-kochi-net-origins",
    category: "conflicting",
    question: "Where did Kochi's Chinese fishing nets come from?",
    lang: "en",
    expect: { outcomes: ["routine_approved", "qualified"], minSources: 1 },
    env: { QUALITY_GATE_PASSED_LANGUAGES: "en" },
    script: {
      understand: understand("Where did Kochi's Chinese fishing nets come from?"),
      answer: ({ cite }) => {
        const a = cite("introduced by Chinese explorers who landed there in the 14th century");
        const b = cite("may have been introduced by the Chinese explorer Zheng He");
        return answer("Their origin is attributed to Chinese contact, but accounts differ in certainty.", [a, b], [pt("One account states the nets were introduced by Chinese explorers in the 14th century.", "contested", a), pt("Another says they may have been introduced by Zheng He.", "uncertain", b)], {
          conflict_detected: true,
          perspectives: [
            { label: "Stated as fact", text: "Introduced by 14th-century Chinese explorers.", citations: [a!.id] },
            { label: "Stated as possibility", text: "Possibly introduced by Zheng He.", citations: [b!.id] },
          ],
          limitations: ["Both statements come from a single tertiary source."],
        });
      },
      judge: "all_yes",
    },
  },
  {
    id: "sensitive-caste",
    category: "sensitive",
    question: "How did caste shape the layout of Madurai around the temple?",
    lang: "en",
    expect: { outcomes: ["qualified", "abstained"], failedChecksInclude: ["sensitivity"] },
    liveExpect: { outcomes: ["qualified", "abstained"] },
    env: { QUALITY_GATE_PASSED_LANGUAGES: "en" },
    script: {
      understand: understand("How did caste shape the layout of Madurai around the temple?", "sensitive"),
      answer: ({ cite }) => {
        const c = cite("streets and junctions are named after months of the Tamil Calendar");
        return answer("Sources describe the street plan around the temple.", [c], [pt("Streets around the temple are named after Tamil calendar months.", "documented", c)], {
          limitations: ["The sources used do not examine social history in depth; specialist and community sources are needed."],
        });
      },
      judge: "all_yes",
    },
  },
  {
    id: "high-risk-ranking-religions",
    category: "high_risk",
    question: "Which religion is superior, Hinduism or Buddhism?",
    lang: "en",
    expect: { outcomes: ["abstained"], abstainReason: "sensitive" },
    script: { answer: () => ({ __error: "should_not_be_called" }) },
  },
  {
    id: "out-of-scope",
    category: "out_of_scope",
    question: "Can you write me a Python script to sort a list?",
    lang: "en",
    expect: { outcomes: ["abstained"], abstainReason: "out_of_scope" },
    script: { understand: understand("Can you write me a Python script to sort a list?", "routine", false) },
  },
  {
    id: "multilingual-hindi-answer",
    category: "multilingual",
    question: "जयपुर का जंतर मंतर कब पूरा हुआ?",
    lang: "hi",
    expect: { outcomes: ["qualified"], failedChecksInclude: ["language_quality_gate"] },
    liveExpect: { outcomes: ["qualified", "abstained"] },
    script: {
      understand: { ...understand("जयपुर का जंतर मंतर कब पूरा हुआ?"), search_query_en: "Jantar Mantar Jaipur completed", search_query_native: "जंतर मंतर जयपुर" },
      answer: ({ cite }) => {
        const c = cite("The monument was completed in 1734");
        return answer("जयपुर का जंतर मंतर 1734 में पूरा हुआ था।", [c], [pt("सवाई जय सिंह द्वारा बनवाया गया यह स्मारक 1734 में पूरा हुआ।", "documented", c)], {
          limitations: ["स्रोत अंग्रेज़ी में है।"],
        });
      },
      judge: "all_yes",
    },
  },
  {
    id: "multilingual-wrong-language",
    category: "multilingual",
    question: "জন্তর মন্তর কত সালে সম্পূর্ণ হয়?",
    lang: "bn",
    expect: { outcomes: ["qualified"], failedChecksInclude: ["language_script"] },
    script: {
      understand: { ...understand("Jantar Mantar completed"), search_query_en: "Jantar Mantar Jaipur completed" },
      answer: ({ cite }) => {
        const c = cite("The monument was completed in 1734");
        // Model answers in English although Bengali was requested.
        return answer("It was completed in 1734.", [c], [pt("The Jaipur monument was completed in 1734.", "documented", c)]);
      },
      judge: "all_yes",
    },
  },
  {
    id: "retrieval-failure",
    category: "retrieval_failure",
    question: "What is the history of the Jantar Mantar in Jaipur?",
    lang: "en",
    expect: { outcomes: ["failed"], abstainReason: "retrieval_failed" },
    env: { RETRIEVAL_PROVIDERS: "wikipedia" },
    script: { understand: understand("What is the history of the Jantar Mantar in Jaipur?") },
  },
  {
    id: "provider-failure",
    category: "provider_failure",
    question: "Why are the ghats of Varanasi important?",
    lang: "en",
    expect: { outcomes: ["failed"], abstainReason: "provider_failed" },
    script: { understand: understand("Why are the ghats of Varanasi important?"), answer: () => ({ __error: "provider_error" }) },
  },
  {
    id: "provider-refusal",
    category: "provider_failure",
    question: "Tell me about the cremation ghats of Varanasi.",
    lang: "en",
    expect: { outcomes: ["abstained"], abstainReason: "sensitive" },
    script: { understand: understand("Tell me about the cremation ghats of Varanasi."), answer: () => ({ __error: "refusal" }) },
  },
  {
    id: "judge-unavailable",
    category: "provider_failure",
    question: "When was Hampi the capital of the Vijayanagara Empire?",
    lang: "en",
    expect: { outcomes: ["qualified"], failedChecksInclude: ["claim_support_judge"] },
    env: { QUALITY_GATE_PASSED_LANGUAGES: "en" },
    script: {
      understand: understand("When was Hampi the capital of the Vijayanagara Empire?"),
      answer: ({ cite }) => {
        const c = cite("capital of the Vijayanagara (Karnata) Empire from 1336 to 1565");
        return answer("From 1336 to 1565.", [c], [pt("Hampi was the capital from 1336 to 1565.", "documented", c)]);
      },
      judge: { __error: "timeout" },
    },
  },
  {
    id: "malformed-model-output",
    category: "provider_failure",
    question: "What is Durga Puja in Kolkata?",
    lang: "en",
    expect: { outcomes: ["failed"], abstainReason: "provider_failed" },
    script: { understand: understand("What is Durga Puja in Kolkata?"), answer: () => ({ summary: 42, sections: "not-an-array" }) },
  },
];

/** Inputs the API must reject before any retrieval or model call. */
export const MALFORMED_INPUTS: unknown[] = ["", "  ", "a", "x".repeat(501), null, 42, { q: "object" }];
