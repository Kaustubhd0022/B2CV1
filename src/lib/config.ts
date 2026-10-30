import "server-only";
import { z } from "zod";

/**
 * Server-side configuration. Everything that is an OPEN product decision
 * (thresholds, retention, language gates) is configurable here and marked
 * provisional in .env.example. Secrets are only ever read on the server.
 */
const csv = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const bool = (v: string | undefined, fallback: boolean) =>
  v === undefined || v === "" ? fallback : ["1", "true", "yes", "on"].includes(v.toLowerCase());

const num = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return v === undefined || v === "" || Number.isNaN(n) ? fallback : n;
};

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_URL: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  PGLITE_DIR: z.string().default(".data/pglite"),
});

/** Explicit LLM_PROVIDER wins; otherwise the first provider with a key (Groq, Gemini, Anthropic). */
function llmProvider(): "anthropic" | "groq" | "gemini" | "auto" | "none" | "scripted" {
  const p = process.env.LLM_PROVIDER;
  if (p === "anthropic" || p === "groq" || p === "gemini" || p === "auto" || p === "none" || p === "scripted") return p;
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "none";
}

function load() {
  const isVercel = Boolean(process.env.VERCEL);
  const rawUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const normalizedUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  const rawPglite = process.env.PGLITE_DIR || (isVercel ? "/tmp/pglite" : ".data/pglite");

  const env = EnvSchema.parse({
    ...process.env,
    APP_URL: normalizedUrl,
    PGLITE_DIR: rawPglite,
  });
  const isProd = env.NODE_ENV === "production";
  return {
    env: env.NODE_ENV,
    isProd,
    appUrl: env.APP_URL.replace(/\/$/, ""),
    db: {
      url: env.DATABASE_URL,
      pgliteDir: env.PGLITE_DIR,
    },
    auth: {
      sessionDays: num(process.env.SESSION_TTL_DAYS, 14),
      otpMinutes: num(process.env.OTP_TTL_MINUTES, 10),
      otpMaxAttempts: num(process.env.OTP_MAX_ATTEMPTS, 5),
      // Hashing pepper for OTP codes and contact identifiers. Required in production.
      secret: process.env.AUTH_SECRET ?? (isProd ? "" : "dev-only-insecure-secret-change-me"),
      email: {
        provider: (process.env.EMAIL_PROVIDER ?? (isProd ? "" : "dev-outbox")) as
          | "resend"
          | "supabase"
          | "dev-outbox"
          | "screen"
          | "",
        resendApiKey: process.env.RESEND_API_KEY,
        from: process.env.EMAIL_FROM ?? "TattvaCo <no-reply@example.com>",
      },
      sms: {
        provider: (process.env.SMS_PROVIDER ?? (isProd ? "" : "dev-outbox")) as
          | "twilio"
          | "dev-outbox"
          | "screen"
          | "",
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
        twilioFrom: process.env.TWILIO_FROM,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      apple: {
        clientId: process.env.APPLE_CLIENT_ID,
        teamId: process.env.APPLE_TEAM_ID,
        keyId: process.env.APPLE_KEY_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
      },
    },
    // DEVELOPMENT ONLY: verified sign-ins with these emails get the editor role. Ignored in production
    // (use `npm run editor:grant`).
    devEditorEmails: isProd ? [] : csv(process.env.DEV_EDITOR_EMAILS).map((e) => e.toLowerCase()),
    // DEMO MODE: allows on-screen verification codes ("screen" delivery) and labels the app as a demo.
    // For experience walkthroughs only; never for real users.
    demoMode: bool(process.env.DEMO_MODE, false),
    content: {
      // Development fixtures are served by default in prototypes/previews unless explicitly set to false.
      allowFixtures: bool(process.env.ALLOW_FIXTURE_CONTENT, true),
    },
    ai: {
      provider: llmProvider(),
      // Default model per provider; override with LLM_MODEL.
      model:
        process.env.LLM_MODEL ||
        (llmProvider() === "gemini" || llmProvider() === "auto"
          ? "gemini-3.8-flash"
          : llmProvider() === "groq"
          ? "openai/gpt-oss-120b"
          : "claude-opus-5-5"),
      effort: (process.env.LLM_EFFORT ?? "medium") as "low" | "medium" | "high",
      timeoutMs: num(process.env.LLM_TIMEOUT_MS, 15_000),
      judge: bool(process.env.ANSWER_JUDGE, true),
      retrievalProviders: csv(process.env.RETRIEVAL_PROVIDERS ?? "corpus,wikipedia,serpapi"),
      retrievalTimeoutMs: num(process.env.RETRIEVAL_TIMEOUT_MS, 8_000),
      serpApiKey: process.env.SERPAPI_API_KEY,
      // PROVISIONAL thresholds (OD-02). Product owner must approve before launch.
      minPassages: num(process.env.ANSWER_MIN_PASSAGES, 2),
      minPassageScore: num(process.env.ANSWER_MIN_PASSAGE_SCORE, 0.2),
      minCoverage: num(process.env.ANSWER_MIN_COVERAGE, 0.8),
      abstainBelowCoverage: num(process.env.ANSWER_ABSTAIN_BELOW_COVERAGE, 0.5),
      minScriptRatio: num(process.env.ANSWER_MIN_SCRIPT_RATIO, 0.6),
      // Languages whose quality gate has been formally passed (OD-01). Empty by default.
      gatePassedLanguages: csv(process.env.QUALITY_GATE_PASSED_LANGUAGES),
      rateLimitPerMinute: num(process.env.ASK_RATE_LIMIT_PER_MINUTE, 6),
      rateLimitPerDay: num(process.env.ASK_RATE_LIMIT_PER_DAY, 100),
      sessionContextTurns: num(process.env.ASK_SESSION_CONTEXT_TURNS, 3),
    },
    retention: {
      // PROVISIONAL (OD-05). Used only by the purge script; nothing deleted automatically.
      answerRunDays: num(process.env.RETENTION_ANSWER_RUNS_DAYS, 90),
      analyticsDays: num(process.env.RETENTION_ANALYTICS_DAYS, 180),
      resolvedReportDays: num(process.env.RETENTION_RESOLVED_REPORTS_DAYS, 365),
    },
  };
}

export type AppConfig = ReturnType<typeof load>;

let cached: AppConfig | undefined;
export function config(): AppConfig {
  if (!cached) cached = load();
  return cached;
}

/** For tests only: re-read process.env. */
export function resetConfigForTests() {
  cached = undefined;
}

/** Fail fast on misconfiguration that would be unsafe in production. */
export function assertProductionSafety(c: AppConfig = config()) {
  if (!c.isProd) return;
  const problems: string[] = [];
  if (!c.db.url && !c.demoMode) problems.push("DATABASE_URL is required in production (or set DEMO_MODE=true for prototype deployment)");
  if (!c.auth.secret || c.auth.secret.length < 32) problems.push("AUTH_SECRET (>=32 chars) is required");
  if (!c.demoMode && c.auth.email.provider === "dev-outbox") problems.push("EMAIL_PROVIDER=dev-outbox is not allowed in production");
  if (!c.demoMode && c.auth.sms.provider === "dev-outbox") problems.push("SMS_PROVIDER=dev-outbox is not allowed in production");
  if (c.ai.provider === "scripted") problems.push("LLM_PROVIDER=scripted is test-only");
  if (!c.demoMode && (c.auth.email.provider === "screen" || c.auth.sms.provider === "screen"))
    problems.push("On-screen codes (EMAIL_PROVIDER/SMS_PROVIDER=screen) require DEMO_MODE=true");
  if (problems.length) throw new Error("Unsafe production configuration:\n- " + problems.join("\n- "));
}
