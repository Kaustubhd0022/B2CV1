import { z } from "zod";

/** A retrieved piece of evidence. Its id (P1, P2…) is the only thing the model may cite. */
export type Passage = {
  id: string;
  text: string;
  heading?: string;
  score: number;
  provider: "corpus" | "wikipedia" | "serpapi";
  source: SourceRef;
};

export type SourceRef = {
  key: string; // dedupe key (url or internal id)
  title: string;
  publisher: string | null;
  url: string | null; // internal paths for TattvaCo content, permalinks for external
  language: string;
  sourceType: "editorial" | "primary" | "official" | "academic" | "specialist" | "reference" | "media" | "community" | "other";
  tier: 1 | 2 | 3;
  revision?: string;
  internal?: { kind: "story" | "connection"; slug: string; isFixture: boolean };
};

export type RetrievalOutcome = {
  passages: Passage[];
  providersTried: string[];
  providersFailed: string[];
};

export const EPISTEMIC = ["documented", "tradition", "interpretation", "contested", "uncertain"] as const;
export type Risk = "routine" | "sensitive" | "high_risk";

/** Query understanding (optional LLM step). */
export const UnderstandingSchema = z.object({
  in_scope: z.boolean().describe("True if the question is about Indian culture, history, traditions, arts, places or their connections."),
  risk: z.enum(["routine", "sensitive", "high_risk"]),
  risk_reason: z.string(),
  standalone_question: z.string().describe("The question rewritten to stand alone, using session context only if it is a follow-up."),
  search_query_en: z.string().describe("A concise English keyword search query."),
  search_query_native: z.string().describe("A concise search query in the user's language (same as English if the language is English)."),
});
export type Understanding = z.infer<typeof UnderstandingSchema>;

/** Model draft. Every point must carry citations and verbatim quotes, verified afterwards. */
export const AnswerDraftSchema = z.object({
  status: z.enum(["answered", "insufficient_evidence"]),
  summary: z.string(),
  summary_citations: z.array(z.string()),
  sections: z.array(
    z.object({
      heading: z.string(),
      points: z.array(
        z.object({
          text: z.string(),
          epistemic: z.enum(EPISTEMIC),
          citations: z.array(z.string()),
          quotes: z.array(z.object({ passage: z.string(), quote: z.string() })),
        }),
      ),
    }),
  ),
  perspectives: z.array(z.object({ label: z.string(), text: z.string(), citations: z.array(z.string()) })),
  conflict_detected: z.boolean(),
  limitations: z.array(z.string()),
  follow_up_questions: z.array(z.string()),
});
export type AnswerDraft = z.infer<typeof AnswerDraftSchema>;

export const JudgeSchema = z.object({
  verdicts: z.array(z.object({ point: z.string(), supported: z.enum(["yes", "partly", "no"]) })),
});
export type JudgeVerdicts = z.infer<typeof JudgeSchema>;

export type CheckStatus = "pass" | "fail" | "indeterminate" | "not_applicable";
export type CheckResult = { id: string; mandatory: boolean; status: CheckStatus; detail?: string };

export type Outcome = "routine_approved" | "qualified" | "abstained" | "evidence_only" | "failed";
export type AbstainReason = "insufficient_evidence" | "sensitive" | "out_of_scope" | "retrieval_failed" | "provider_failed";

/** What the client renders. Contains no account data. */
export type AskResult = {
  runId: string;
  outcome: Outcome;
  abstainReason?: AbstainReason;
  risk: Risk;
  language: string;
  languageValidated: boolean;
  /** Script-detected language of the question when it differs from the selected language. */
  detectedLanguage?: string;
  summary: string | null;
  summarySources: number[];
  sections: { heading: string; points: { text: string; epistemic: (typeof EPISTEMIC)[number]; sources: number[] }[] }[];
  perspectives: { label: string; text: string; sources: number[] }[];
  limitations: string[];
  followUps: string[];
  sources: (SourceRef & { n: number; quotes: string[] })[];
  /** Retrieved but not used to support statements (shown for insufficient-evidence / evidence-only states). */
  foundSources: (SourceRef & { excerpt: string })[];
  failedChecks: { id: string; status: CheckStatus }[];
  retrievalIssues: string[];
  nextDiscoveries: { kind: "story" | "connection"; slug: string; title: string; isFixture: boolean }[];
};
