"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  label: string;
  number: string;
}

export function StoryTableOfContents({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(items[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const formattedItems: TocItem[] = items.map((item, index) => ({
    ...item,
    number: (index + 1).toString().padStart(2, "0"),
  }));

  return (
    <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <h3 className="text-meta font-semibold uppercase tracking-wider text-gold">
          On This Page
        </h3>
      </div>

      <nav aria-label="Table of contents" className="mt-3">
        <ul className="space-y-1 text-meta">
          {formattedItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`flex items-baseline gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors ${
                    isActive
                      ? "bg-gold/15 text-gold font-semibold"
                      : "text-muted hover:text-charcoal hover:bg-surface-2"
                  }`}
                >
                  <span className="font-mono text-[11px] opacity-75">{item.number}</span>
                  <span className="truncate leading-snug">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
