import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { closeDb } from "@/lib/db/client";
import { ingestContent } from "@/lib/content/ingest";
import { resetConfigForTests } from "@/lib/config";
import { runAsk, validateQuestion } from "@/lib/ai/pipeline";
import { ScriptedProvider, setProviderForTests, type LLMTask } from "@/lib/ai/llm";
import { CASES, MALFORMED_INPUTS, type ScriptCtx } from "../eval/cases";
import type { LanguageCode } from "@/lib/i18n/languages";

function passagesFrom(user: string) {
  return [...user.matchAll(/<passage id="(P\d+)"[^>]*>\n([\s\S]*?)\n<\/passage>/g)].map((m) => ({ id: m[1], text: m[2] }));
}

beforeAll(async () => {
  const report = await ingestContent({ publishFixtures: true });
  expect(report.errors).toEqual([]);
});
afterAll(closeDb);

const BASE_ENV = { ...process.env };
afterEach(() => {
  process.env = { ...BASE_ENV };
  resetConfigForTests();
  setProviderForTests(undefined as never);
  vi.unstubAllGlobals();
});

describe("evaluation cases (scripted model, real retrieval and checks)", () => {
  for (const c of CASES) {
    it(`${c.category}: ${c.id}`, async () => {
      Object.assign(process.env, { RETRIEVAL_PROVIDERS: "corpus", ANSWER_JUDGE: "true", ...c.env });
      resetConfigForTests();
      if (c.env?.RETRIEVAL_PROVIDERS?.includes("wikipedia")) {
        vi.stubGlobal("fetch", vi.fn(async () => {
          throw new Error("network down");
        }));
      }
      const calls: LLMTask[] = [];
      setProviderForTests(
        new ScriptedProvider((task, user) => {
          calls.push(task);
          if (task === "understand") return c.script?.understand ?? { __error: "provider_error" };
          if (task === "answer") {
            const passages = passagesFrom(user);
            const ctx: ScriptCtx = {
              passages,
              cite: (snippet) => {
                const p = passages.find((x) => x.text.includes(snippet));
                return p ? { id: p.id, quote: snippet } : null;
              },
            };
            return c.script?.answer ? c.script.answer(ctx) : { __error: "provider_error" };
          }
          if (task === "judge") {
            if (c.script?.judge && typeof c.script.judge === "object") return c.script.judge;
            const ids = [...user.matchAll(/<statement id="([^"]+)">/g)].map((m) => m[1]);
            return { verdicts: ids.map((point) => ({ point, supported: "yes" })) };
          }
          return { __error: "provider_error" };
        }),
      );

      const { result } = await runAsk({ question: c.question, lang: c.lang as LanguageCode, context: [] });

      expect(c.expect.outcomes, JSON.stringify(result.failedChecks)).toContain(result.outcome);
      if (c.expect.abstainReason) expect(result.abstainReason).toBe(c.expect.abstainReason);
      for (const id of c.expect.failedChecksInclude ?? []) expect(result.failedChecks.map((f) => f.id)).toContain(id);
      if (c.expect.minSources) expect(result.sources.length).toBeGreaterThanOrEqual(c.expect.minSources);
      const shown = [result.summary ?? "", ...result.sections.flatMap((s) => s.points.map((p) => p.text))].join(" ");
      for (const bad of c.expect.mustNotShow ?? []) expect(shown).not.toContain(bad);

      // Invariants that hold for every case:
      expect(result.runId).toBeTruthy();
      if (result.outcome === "routine_approved") expect(result.failedChecks).toEqual([]);
      for (const s of result.sections) for (const p of s.points) expect(p.sources.length).toBeGreaterThan(0);
      for (const s of result.sources) expect(s.url ?? "").not.toBe(""); // every shown source is traceable
      if (c.category === "high_risk") expect(calls).not.toContain("answer");
      if (c.id === "insufficient-no-retrieval-matches") expect(calls).not.toContain("answer");
    });
  }
});

describe("pipeline behaviour without a model", () => {
  it("returns retrieved evidence only, never a simulated answer", async () => {
    Object.assign(process.env, { RETRIEVAL_PROVIDERS: "corpus" });
    resetConfigForTests();
    setProviderForTests(null);
    const { result, contextTurn } = await runAsk({ question: "Jantar Mantar Jaipur instruments", lang: "en", context: [] });
    expect(result.outcome).toBe("evidence_only");
    expect(result.summary).toBeNull();
    expect(result.sections).toEqual([]);
    expect(result.foundSources.length).toBeGreaterThan(0);
    expect(contextTurn).toBeNull();
  });

  it("still abstains on high-risk questions without a model", async () => {
    setProviderForTests(null);
    const { result } = await runAsk({ question: "Which caste is superior?", lang: "en", context: [] });
    expect(result.outcome).toBe("abstained");
    expect(result.abstainReason).toBe("sensitive");
  });
});

describe("session-only context", () => {
  it("passes earlier turns to the model for follow-ups, and only those given", async () => {
    Object.assign(process.env, { RETRIEVAL_PROVIDERS: "corpus" });
    resetConfigForTests();
    let seen = "";
    setProviderForTests(
      new ScriptedProvider((task, user) => {
        if (task === "understand") {
          seen = user;
          return { in_scope: false, risk: "routine", risk_reason: "", standalone_question: "x", search_query_en: "x", search_query_native: "x" };
        }
        return { __error: "provider_error" };
      }),
    );
    await runAsk({ question: "And who built it?", lang: "en", context: [{ q: "What is Jantar Mantar?", a: "An observatory.", lang: "en" }] });
    expect(seen).toContain("What is Jantar Mantar?");
    await runAsk({ question: "And who built it?", lang: "en", context: [] });
    expect(seen).not.toContain("What is Jantar Mantar?");
  });
});

describe("input validation", () => {
  it.each(MALFORMED_INPUTS.map((x) => [x]))("rejects %j", (input) => {
    expect(validateQuestion(input).ok).toBe(false);
  });
  it("accepts and normalises a valid question", () => {
    expect(validateQuestion("  Why   the lotus? ")).toEqual({ ok: true, question: "Why the lotus?" });
  });
});
