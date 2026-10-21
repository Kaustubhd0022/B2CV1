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
  // Floating pill of circular buttons (editorial mobile navigation). Labels stay available to assistive tech.
  return (
    <nav aria-label={labels.main} className="fixed inset-x-0 bottom-4 z-40 flex justify-center pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex items-center gap-2 rounded-full border border-border bg-surface/95 p-1.5 shadow-lg backdrop-blur-md">
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
                  "flex size-12 items-center justify-center rounded-full transition-all",
                  active ? "bg-forest text-on-forest shadow-xs" : "text-muted hover:bg-surface-2 hover:text-charcoal",
                )}
              >
                <Icon width={20} height={20} />
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
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1 text-meta font-medium text-charcoal shadow-2xs hover:border-forest/40 hover:bg-surface-2 transition-colors"
      aria-label={`${label}: ${native}`}
    >
      <span className="text-terracotta text-xs" aria-hidden="true">●</span>
      <span lang={lang}>{native}</span>
    </Link>
  );
}
