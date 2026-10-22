"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconAsk,
  IconDiscover,
  IconExplore,
  IconSettings,
} from "./icons";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      active: pathname === "/",
    },
    {
      href: "/explore",
      label: "Explore",
      icon: <IconDiscover width={20} height={20} />,
      active: pathname.startsWith("/explore") || pathname.startsWith("/stories"),
    },
    {
      href: "/places",
      label: "Atlas",
      icon: <IconExplore width={20} height={20} />,
      active: pathname.startsWith("/places") || pathname.startsWith("/cities"),
    },
    {
      href: "/ask",
      label: "Ask AI",
      icon: <IconAsk width={20} height={20} />,
      active: pathname.startsWith("/ask"),
    },
    {
      href: "/settings/account",
      label: "Account",
      icon: <IconSettings width={20} height={20} />,
      active: pathname.startsWith("/settings") || pathname.startsWith("/sign-in"),
    },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border/80 bg-[#12100e]/95 backdrop-blur-lg shadow-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <li key={item.href} className="flex-1">
            <Link
              href={item.href}
              className={`flex flex-col items-center justify-center h-full py-1 text-center transition-colors relative ${
                item.active
                  ? "text-gold font-semibold"
                  : "text-muted hover:text-charcoal"
              }`}
            >
              <span className="flex items-center justify-center">
                {item.icon}
              </span>
              <span className="text-[10px] tracking-tight mt-1 leading-none">
                {item.label}
              </span>
              {item.active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gold" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
