"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconAsk, IconDiscover, IconExplore, IconSettings } from "./icons";
import { cx } from "./ui";

type Labels = { discover: string; explore: string; ask: string; settings: string; main: string };

const ITEMS = [
  { href: "/", key: "discover", Icon: IconDiscover, match: (p: string) => p === "/" || p.startsWith("/connections") },
  { href: "/explore", key: "explore", Icon: IconExplore, match: (p: string) => p.startsWith("/explore") || p.startsWith("/cities") || p.startsWith("/stories") },
  { href: "/ask", key: "ask", Icon: IconAsk, match: (p: string) => p.startsWith("/ask") },
  { href: "/settings", key: "settings", Icon: IconSettings, match: (p: string) => p.startsWith("/settings") || p.startsWith("/report") },
] as const;

/** Mobile: fixed bottom bar. Desktop: inline header navigation. (Design §1) */
export function MainNav({ labels, variant }: { labels: Labels; variant: "bottom" | "top" }) {
  const pathname = usePathname();
  if (variant === "top") {
    return (
      <nav aria-label={labels.main} className="hidden md:block">
        <ul className="flex gap-1">
          {ITEMS.map(({ href, key, match }) => {
            const active = match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "inline-flex min-h-11 items-center rounded-full px-4 text-support font-semibold",
                    active ? "bg-forest text-on-forest" : "text-muted hover:text-charcoal",
                  )}
                >
                  {labels[key]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
  // Floating pill of circular buttons (cinematic reference). Labels stay available to assistive tech.
  return (
    <nav aria-label={labels.main} className="fixed inset-x-0 bottom-4 z-40 flex justify-center pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="glass flex gap-2 rounded-full p-1.5 shadow-2xl shadow-black/60">
        {ITEMS.map(({ href, key, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={labels[key]}
                title={labels[key]}
                className={cx(
                  "flex size-14 items-center justify-center rounded-full transition-colors",
                  active ? "bg-forest text-on-forest" : "bg-black/60 text-charcoal hover:bg-black/80",
                )}
              >
                <Icon width={22} height={22} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Language chip that returns the user to the current page after changing language. */
export function LanguageLink({ lang, native, label }: { lang: string; native: string; label: string }) {
  const pathname = usePathname();
  return (
    <Link
      href={`/language?next=${encodeURIComponent(pathname)}`}
      className="glass inline-flex min-h-11 items-center rounded-full px-4 text-meta font-semibold text-charcoal hover:bg-surface-2"
      aria-label={`${label}: ${native}`}
    >
      <span lang={lang}>{native}</span>
    </Link>
  );
}
