"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconAsk, IconDiscover, IconExplore, IconSettings } from "./icons";
import { cx } from "./ui";

type Labels = {
  discover: string;
  explore: string;
  atlas?: string;
  ask: string;
  comingSoon?: string;
  settings: string;
  main: string;
};

const TOP_ITEMS = [
  {
    href: "/",
    key: "discover",
    fallbackLabel: "Discover",
    match: (p: string) => p === "/" || p.startsWith("/connections"),
  },
  {
    href: "/explore",
    key: "explore",
    fallbackLabel: "Explore",
    match: (p: string) => p.startsWith("/explore") || p.startsWith("/stories"),
  },
  {
    href: "/places",
    key: "atlas",
    fallbackLabel: "Atlas",
    match: (p: string) => p.startsWith("/places") || p.startsWith("/cities"),
  },
  {
    href: "/ask",
    key: "ask",
    fallbackLabel: "Ask",
    match: (p: string) => p.startsWith("/ask"),
  },
  {
    href: "/coming-soon",
    key: "comingSoon",
    fallbackLabel: "Coming Soon",
    match: (p: string) => p.startsWith("/coming-soon"),
  },
] as const;

const ITEMS = [
  {
    href: "/",
    key: "discover",
    fallbackLabel: "Home",
    Icon: IconDiscover,
    match: (p: string) => p === "/" || p.startsWith("/connections"),
  },
  {
    href: "/explore",
    key: "explore",
    fallbackLabel: "Explore",
    Icon: IconDiscover,
    match: (p: string) => p.startsWith("/explore") || p.startsWith("/stories"),
  },
  {
    href: "/places",
    key: "atlas",
    fallbackLabel: "Atlas",
    Icon: IconExplore,
    match: (p: string) => p.startsWith("/places") || p.startsWith("/cities"),
  },
  {
    href: "/ask",
    key: "ask",
    fallbackLabel: "Ask AI",
    Icon: IconAsk,
    match: (p: string) => p.startsWith("/ask"),
  },
  {
    href: "/settings/account",
    key: "settings",
    fallbackLabel: "Account",
    Icon: IconSettings,
    match: (p: string) => p.startsWith("/settings") || p.startsWith("/report") || p.startsWith("/sign-in"),
  },
] as const;

/** Mobile: docked bottom tab bar with safe-area insets. Desktop: inline header navigation. */
export function MainNav({ labels, variant }: { labels: Labels; variant: "bottom" | "top" }) {
  const pathname = usePathname();

  if (variant === "top") {
    return (
      <nav aria-label={labels.main} className="hidden md:block">
        <ul className="flex items-center gap-1.5">
          {TOP_ITEMS.map(({ href, key, fallbackLabel, match }) => {
            const active = match(pathname);
            const labelText = (key in labels ? labels[key as keyof Labels] : fallbackLabel) || fallbackLabel;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "inline-flex min-h-9 items-center rounded-full px-3.5 text-support font-medium transition-all duration-200",
                    active
                      ? "bg-gold text-[#12100e] shadow-xs font-semibold"
                      : "text-secondary-text hover:text-charcoal hover:bg-surface-2",
                  )}
                >
                  {labelText}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  // Mobile docked bottom bar with safe-area padding matching Reference Page 2
  return (
    <nav
      aria-label={labels.main}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-[#12100e]/95 pb-[env(safe-area-inset-bottom)] shadow-xl backdrop-blur-lg md:hidden"
    >
      <ul className="flex h-16 items-center justify-around px-2">
        {ITEMS.map(({ href, key, fallbackLabel, Icon, match }) => {
          const active = match(pathname);
          const labelText = (key in labels ? labels[key as keyof Labels] : fallbackLabel) || fallbackLabel;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={labelText}
                className={cx(
                  "flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-medium transition-colors relative",
                  active ? "text-gold font-semibold" : "text-muted hover:text-charcoal",
                )}
              >
                <div
                  className={cx(
                    "flex size-7 items-center justify-center rounded-full transition-all",
                    active ? "bg-gold/15 text-gold" : "text-muted",
                  )}
                >
                  <Icon width={18} height={18} />
                </div>
                <span className="leading-none">{labelText}</span>
                {active && (
                  <span className="absolute bottom-0.5 size-1 rounded-full bg-gold" />
                )}
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
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border/80 bg-surface px-3 py-1 text-meta font-medium text-charcoal shadow-2xs hover:border-gold/40 hover:bg-surface-2 transition-all duration-200"
      aria-label={`${label}: ${native}`}
    >
      <span className="size-2 rounded-full bg-gold" aria-hidden="true" />
      <span lang={lang} className="text-support">{native}</span>
    </Link>
  );
}
