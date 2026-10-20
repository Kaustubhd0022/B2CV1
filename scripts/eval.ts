/**
 * Live evaluation: npm run eval [-- --retrieval-only] [-- --case <id>]
 *
 * Runs tests/eval/cases.ts questions against the CONFIGURED providers (real model, real
 * retrieval). Grades outcome categories and structural invariants only; it cannot prove
 * factual correctness — export the report for human citation audit (PRD §13.4).
 * Costs money when a model is configured. Writes eval-report.json.
 */
import { writeFileSync } from "node:fs";
import { config } from "@/lib/config";
import { closeDb } from "@/lib/db/client";
import { runAsk } from "@/lib/ai/pipeline";
import { retrieve } from "@/lib/ai/retrieval";
import { getProvider } from "@/lib/ai/llm";
import { CASES } from "../tests/eval/cases";
import type { LanguageCode } from "@/lib/i18n/languages";

const args = process.argv.slice(2);
const only = args.includes("--case") ? args[args.indexOf("--case") + 1] : null;
const retrievalOnly = args.includes("--retrieval-only") || !getProvider();
// Failure-injection cases rely on scripted behaviour and are skipped live.
const cases = CASES.filter((c) => !["retrieval_failure", "provider_failure"].includes(c.category) && (!only || c.id === only));

console.log(`Providers: llm=${config().ai.provider} model=${config().ai.model} retrieval=${config().ai.retrievalProviders.join(",")}`);
if (retrievalOnly) console.log("Mode: retrieval-only (no model configured or --retrieval-only)\n");

const rows: Record<string, unknown>[] = [];
let pass = 0;
for (const c of cases) {
  if (retrievalOnly) {
    const r = await retrieve({ queryEn: c.question, queryNative: c.question, lang: c.lang });
    const top = r.passages.slice(0, 3).map((p) => `${p.id} ${p.score.toFixed(2)} [${p.provider}] ${p.source.title}`);
    console.log(`• ${c.id}\n  passages=${r.passages.length} failed=${r.providersFailed.join(",") || "-"}\n  ${top.join("\n  ")}`);
    rows.push({ id: c.id, passages: r.passages.length, failed: r.providersFailed, top: r.passages.slice(0, 5).map((p) => ({ score: p.score, title: p.source.title, url: p.source.url })) });
    continue;
  }
  const t0 = Date.now();
  const { result } = await runAsk({ question: c.question, lang: c.lang as LanguageCode, context: [] });
  const expected = c.liveExpect?.outcomes ?? c.expect.outcomes;
  const ok = expected.includes(result.outcome);
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.id}: ${result.outcome}${result.abstainReason ? `/${result.abstainReason}` : ""} (expected ${expected.join("|")}) ${Date.now() - t0}ms`);
  rows.push({
    id: c.id,
    category: c.category,
    expected,
    outcome: result.outcome,
    ok,
    failedChecks: result.failedChecks,
    summary: result.summary,
    points: result.sections.flatMap((s) => s.points),
    sources: result.sources.map((s) => ({ n: s.n, title: s.title, url: s.url, quotes: s.quotes })),
  });
}
writeFileSync("eval-report.json", JSON.stringify({ at: new Date().toISOString(), retrievalOnly, rows }, null, 2));
if (!retrievalOnly) console.log(`\n${pass}/${cases.length} outcome expectations met. Review eval-report.json for citation audit.`);
await closeDb();
