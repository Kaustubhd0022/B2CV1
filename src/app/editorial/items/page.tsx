import Link from "next/link";
import { listItems } from "@/lib/content/editorial";

export const metadata = { title: "Content" };

export default async function ItemsPage() {
  const items = await listItems();
  return (
    <div>
      <h1 className="font-serif text-page font-semibold">Stories and connections</h1>
      <p className="mt-1 text-support text-muted">
        New content and corrections arrive as drafts via <code>npm run content:ingest</code> (files in <code>content/</code>) or as AI connection proposals.
      </p>
      <div className="mt-6 overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full min-w-[40rem] text-left text-support">
          <thead className="border-b border-border bg-surface-2">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Kind</th>
              <th className="p-3">City</th>
              <th className="p-3">Versions</th>
              <th className="p-3">Flags</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-border align-top">
                <td className="p-3">
                  <Link href={`/editorial/items/${i.id}`} className="font-semibold text-forest underline-offset-4 hover:underline">
                    {i.title}
                  </Link>
                  <span className="block text-meta text-muted">{i.slug}</span>
                </td>
                <td className="p-3">{i.kind}</td>
                <td className="p-3">{i.citySlug ?? "—"}</td>
                <td className="p-3 text-meta">
                  {i.versions.map((v) => (
                    <span key={v.id} className="block">
                      {v.language} v{v.versionNo}: <strong>{v.status}</strong>
                    </span>
                  ))}
                </td>
                <td className="p-3 text-meta">
                  {i.isFixture && <span className="block text-warning">Development fixture</span>}
                  {i.origin === "ai_proposed" && <span className="block text-info">AI proposal</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
