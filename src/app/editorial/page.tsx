import Link from "next/link";
import { dashboardCounts, listItems } from "@/lib/content/editorial";
import { Card } from "@/components/ui";

export const metadata = { title: "Queue" };

export default async function EditorialHome() {
  const [c, items] = await Promise.all([dashboardCounts(), listItems()]);
  const pending = items.filter((i) => i.versions.some((v) => ["in_review", "approved", "draft", "changes_requested"].includes(v.status)));
  const tiles: [string, number, string][] = [
    ["Drafts", c.versions.draft ?? 0, "/editorial/items"],
    ["In review", c.versions.in_review ?? 0, "/editorial/items"],
    ["Approved, not published", c.versions.approved ?? 0, "/editorial/items"],
    ["Published", c.versions.published ?? 0, "/editorial/items"],
    ["New reports", c.reports.new ?? 0, "/editorial/reports?status=new"],
    ["Answers abstained (7d)", c.answers.abstained ?? 0, "/editorial/answers?outcome=abstained"],
    ["Answers qualified (7d)", c.answers.qualified ?? 0, "/editorial/answers?outcome=qualified"],
    ["Answer failures (7d)", c.answers.failed ?? 0, "/editorial/answers?outcome=failed"],
  ];
  return (
    <div>
      <h1 className="font-serif text-page font-semibold">Content review queue</h1>
      <p className="mt-1 text-support text-muted">
        Workflow: draft → in review → approved → published; correct or withdraw at any time. Only editors can approve or publish. AI output is never published without review.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([label, n, href]) => (
          <li key={label}>
            <Link href={href} className="block rounded-md border border-border bg-surface p-4 hover:border-forest">
              <span className="block font-serif text-display font-semibold text-forest">{n}</span>
              <span className="text-support">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-serif text-section font-semibold">Needs attention</h2>
      <Card className="mt-3 divide-y divide-border">
        {pending.length === 0 && <p className="p-4 text-support text-muted">Nothing pending.</p>}
        {pending.map((i) => (
          <Link key={i.id} href={`/editorial/items/${i.id}`} className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-surface-2">
            <span>
              <span className="text-meta uppercase text-muted">{i.kind}</span> <span className="font-semibold">{i.title}</span>
              {i.origin === "ai_proposed" && <span className="ml-2 rounded-sm bg-info/10 px-1.5 text-meta text-info">AI proposal</span>}
            </span>
            <span className="text-meta text-muted">{i.versions.map((v) => `${v.language} v${v.versionNo}: ${v.status}`).join(" · ")}</span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
