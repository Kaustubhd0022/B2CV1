import Link from "next/link";
import { requireEditor } from "@/lib/auth/session";

export const metadata = { title: { default: "Editorial", template: "%s · Editorial · TattvaCo" } };

/** E01: protected editorial area. Not linked from public navigation (IA §4). */
export default async function EditorialLayout({ children }: { children: React.ReactNode }) {
  const s = await requireEditor();
  const nav = [
    ["/editorial", "Queue"],
    ["/editorial/items", "Content"],
    ["/editorial/reports", "Reports"],
    ["/editorial/answers", "Answer checks"],
    ["/editorial/propose", "Propose connection"],
  ];
  return (
    <div lang="en" className="min-h-dvh bg-canvas">
      <header className="border-b border-border bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <p className="font-semibold">
            TattvaCo <span className="font-normal text-white/70">· Editorial (internal)</span>
          </p>
          <nav aria-label="Editorial">
            <ul className="flex flex-wrap gap-1 text-support">
              {nav.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex min-h-11 items-center rounded px-3 hover:bg-white/10">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/" className="inline-flex min-h-11 items-center rounded px-3 text-white/70 hover:bg-white/10">
                  Exit to app
                </Link>
              </li>
            </ul>
          </nav>
          <p className="text-meta text-white/70">{s.email ?? s.phone}</p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
