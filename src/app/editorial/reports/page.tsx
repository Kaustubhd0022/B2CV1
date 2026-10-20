import Link from "next/link";
import { listReports } from "@/lib/content/editorial";
import { CATEGORY_TO_PRD } from "@/lib/reports";
import { Card, Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { updateReportAction } from "../actions";

export const metadata = { title: "Reports" };

const STATUSES = ["new", "triaged", "in_progress", "resolved", "dismissed"];

function targetHref(type: string, ref: string) {
  if (type === "story") return `/stories/${ref}`;
  if (type === "connection") return `/connections/${ref}`;
  if (type === "source") return `/sources/${ref}`;
  return null;
}

/** E05: issue review queue. A report never changes content automatically. */
export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string }> }) {
  const sp = await searchParams;
  const reports = await listReports(sp.status);
  return (
    <div>
      <h1 className="font-serif text-page font-semibold">Reported issues</h1>
      <p className="mt-1 text-support text-muted">Reports are anonymous. Response SLA and severity policy are not yet defined (OD-15).</p>
      {sp.ok && <Notice tone="success" className="mt-3">Report updated.</Notice>}
      <nav className="mt-4 flex flex-wrap gap-2 text-meta">
        <Link href="/editorial/reports" className="rounded-full border border-border bg-surface px-3 py-1">
          All
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`?status=${s}`} className={`rounded-full border px-3 py-1 ${sp.status === s ? "border-forest bg-forest text-on-forest" : "border-border bg-surface"}`}>
            {s}
          </Link>
        ))}
      </nav>
      <ul className="mt-4 space-y-3">
        {reports.length === 0 && <p className="text-support text-muted">No reports.</p>}
        {reports.map((r) => {
          const href = targetHref(r.targetType, r.targetRef);
          const snap = r.snapshot as { question?: string; answer?: string; sources?: { title: string; url: string | null }[] } | null;
          return (
            <li key={r.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {r.category.replace(/_/g, " ")} <span className="text-meta font-normal text-muted">(PRD: {CATEGORY_TO_PRD[r.category]})</span>
                  </p>
                  <p className="text-meta text-muted">
                    {r.createdAt.toISOString().slice(0, 16)} · {r.language} · <strong>{r.status}</strong>
                  </p>
                </div>
                <p className="mt-1 text-support">
                  {r.targetType}: {href ? <Link href={href} className="text-forest underline">{r.targetRef}</Link> : r.targetRef}
                </p>
                {r.details && <p className="mt-2 whitespace-pre-wrap text-support">{r.details}</p>}
                {snap && (
                  <details className="mt-2 text-support">
                    <summary className="cursor-pointer text-forest">Answer snapshot (included by reporter)</summary>
                    <p className="mt-1">
                      <strong>Q:</strong> {snap.question}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{snap.answer}</p>
                    <ul className="mt-1 list-disc pl-5 text-meta">
                      {snap.sources?.map((s, i) => (
                        <li key={i}>
                          {s.title} {s.url}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {r.resolutionNote && <p className="mt-2 text-meta text-muted">Resolution: {r.resolutionNote}</p>}
                <form action={updateReportAction} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="reportId" value={r.id} />
                  <label className="text-meta">
                    Status
                    <select name="status" defaultValue={r.status} className="mt-1 block min-h-11 rounded-md border border-border bg-surface px-2">
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex-1 text-meta">
                    Note
                    <input name="note" defaultValue={r.resolutionNote ?? ""} className="mt-1 block min-h-11 w-full rounded-md border border-border bg-surface px-2" />
                  </label>
                  <SubmitButton variant="secondary">Update</SubmitButton>
                </form>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
