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

/** Mobile: docked bottom tab bar with safe-area insets. Desktop: inline header navigation. */
export function MainNav({ labels, variant }: { labels: Labels; variant: "bottom" | "top" }) {
  const pathname = usePathname();

  if (variant === "top") {
    return (
      <nav aria-label={labels.main} className="hidden md:block">
        <ul className="flex items-center gap-1.5">
          {ITEMS.map(({ href, key, match }) => {
            const active = match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "inline-flex min-h-10 items-center rounded-full px-4 text-support font-medium transition-all duration-200",
                    active
                      ? "bg-forest text-on-forest shadow-xs font-semibold"
                      : "text-muted hover:text-charcoal hover:bg-surface-2",
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

  // Mobile docked bottom bar with safe-area padding
  return (
    <nav
      aria-label={labels.main}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-canvas/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-md md:hidden"
    >
      <ul className="flex h-14 items-center justify-around px-2">
        {ITEMS.map(({ href, key, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={labels[key]}
                className={cx(
                  "flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors",
                  active ? "text-forest font-semibold" : "text-muted hover:text-charcoal",
                )}
              >
                <div
                  className={cx(
                    "flex size-8 items-center justify-center rounded-full transition-all",
                    active ? "bg-forest/10 text-forest" : "text-muted",
                  )}
                >
                  <Icon width={18} height={18} />
                </div>
                <span className="leading-none">{labels[key]}</span>
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
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-meta font-medium text-charcoal shadow-2xs hover:border-forest/40 hover:bg-surface-2 transition-all duration-200"
      aria-label={`${label}: ${native}`}
    >
      <span className="size-2 rounded-full bg-terracotta" aria-hidden="true" />
      <span lang={lang} className="text-support">{native}</span>
    </Link>
  );
}
