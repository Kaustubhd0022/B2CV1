import Link from "next/link";
import { listAnswerRuns } from "@/lib/content/editorial";
import type { CheckResult } from "@/lib/ai/types";

export const metadata = { title: "Answer checks" };

const OUTCOMES = ["routine_approved", "qualified", "abstained", "evidence_only", "failed"];

/**
 * Runtime answer audit (FR-12). Records hold check outcomes, sources and timings —
 * deliberately no question text and no account identifier.
 */
export default async function AnswersPage({ searchParams }: { searchParams: Promise<{ outcome?: string }> }) {
  const sp = await searchParams;
  const runs = await listAnswerRuns(sp.outcome);
  return (
    <div>
      <h1 className="font-serif text-page font-semibold">Answer check audit</h1>
      <p className="mt-1 text-support text-muted">Question text is not stored. Use reported issues (with reporter-included snapshots) to review specific answers.</p>
      <nav className="mt-4 flex flex-wrap gap-2 text-meta">
        <Link href="/editorial/answers" className="rounded-full border border-border bg-surface px-3 py-1">
          All
        </Link>
        {OUTCOMES.map((o) => (
          <Link key={o} href={`?outcome=${o}`} className={`rounded-full border px-3 py-1 ${sp.outcome === o ? "border-forest bg-forest text-on-forest" : "border-border bg-surface"}`}>
            {o}
          </Link>
        ))}
      </nav>
      <div className="mt-4 overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full min-w-[48rem] text-left text-meta">
          <thead className="border-b border-border bg-surface-2">
            <tr>
              <th className="p-2">Time</th>
              <th className="p-2">Outcome</th>
              <th className="p-2">Risk</th>
              <th className="p-2">Lang</th>
              <th className="p-2">Non-passing checks</th>
              <th className="p-2">Coverage</th>
              <th className="p-2">Model</th>
              <th className="p-2">ms</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => {
              const failing = (r.checks as CheckResult[]).filter((c) => c.status !== "pass" && c.status !== "not_applicable");
              return (
                <tr key={r.id} className="border-b border-border align-top">
                  <td className="p-2 whitespace-nowrap">{r.createdAt.toISOString().slice(0, 16)}</td>
                  <td className="p-2 font-semibold">{r.outcome}</td>
                  <td className="p-2">{r.risk}</td>
                  <td className="p-2">{r.language}</td>
                  <td className="p-2">
                    {failing.map((c) => (
                      <span key={c.id} className="block">
                        {c.id}: {c.status}
                        {c.mandatory ? "" : " (advisory)"}
                      </span>
                    ))}
                  </td>
                  <td className="p-2">{r.coverage == null ? "—" : r.coverage.toFixed(2)}</td>
                  <td className="p-2">{r.model ?? r.provider}</td>
                  <td className="p-2">{r.latencyMs}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
