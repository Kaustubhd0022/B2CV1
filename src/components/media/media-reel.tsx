"use client";

import { useState } from "react";
import Image from "next/image";
import { IconExternal } from "@/components/icons";
import { cx } from "@/components/ui";

export interface CulturalMediaItem {
  id: string;
  type: "photo" | "video" | "archive_document";
  title: string;
  description: string;
  src: string;
  thumbnailSrc?: string;
  institution: string; // e.g. "Archaeological Survey of India (ASI)"
  institutionUrl: string;
  licenseLabel: string; // e.g. "Official Archaeological Survey Record"
  tierBadge: "Tier 1: Statutory Authority" | "Tier 2: Scholarly Multimedia" | "Tier 3: Documented Community Tradition";
  videoUrl?: string; // YouTube / HTML5 video embed URL if video
  yearOrPeriod?: string;
}

export function CulturalMediaReel({
  items,
  title,
  subtitle,
  className,
}: {
  items: CulturalMediaItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [filterType, setFilterType] = useState<"all" | "photo" | "video">("all");
  const [isZoomed, setIsZoomed] = useState(false);

  const filteredItems = items.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const activeItem = filteredItems[activeIndex] || filteredItems[0] || items[0];

  if (!activeItem) return null;

  return (
    <div
      className={cx(
        "overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-md",
        className,
      )}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4 sm:p-5 bg-surface-2/70">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold">
            <span>✦</span>
            <span>Empirical Media & Statutory Evidence</span>
          </div>
          {title && (
            <h3 className="mt-1 font-serif text-xl font-bold text-charcoal">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-support text-secondary-text">
              {subtitle}
            </p>
          )}
        </div>

        {/* Media type filter tabs */}
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface p-1 shadow-2xs">
          {(["all", "photo", "video"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setFilterType(tab);
                setActiveIndex(0);
              }}
              className={cx(
                "rounded-full px-3 py-1 text-meta font-semibold uppercase tracking-wider transition-colors cursor-pointer",
                filterType === tab
                  ? "bg-gold text-on-gold shadow-xs"
                  : "text-muted hover:text-charcoal",
              )}
            >
              {tab === "all" ? "All Media" : tab === "photo" ? "Photos" : "Video Reels"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative aspect-[16/9] sm:aspect-[21/10] w-full overflow-hidden bg-stone">
        {activeItem.type === "video" && activeItem.videoUrl ? (
          <iframe
            src={activeItem.videoUrl}
            title={activeItem.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full border-0"
          />
        ) : (
          <div
            className="relative size-full cursor-zoom-in"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <Image
              src={activeItem.src}
              alt={activeItem.title}
              fill
              sizes="(min-width: 1200px) 1100px, 100vw"
              className={cx(
                "object-cover transition-transform duration-700 ease-out",
                isZoomed ? "scale-125" : "scale-100 hover:scale-102",
              )}
              priority
            />
            {/* Scrim Overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          </div>
        )}

        {/* Floating Provenance Badge on Top Right */}
        <div className="absolute top-3.5 right-3.5 z-10 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gold/40 bg-black/75 px-3 py-1 text-[11px] font-semibold text-gold shadow-sm backdrop-blur-md">
            {activeItem.tierBadge}
          </span>
        </div>

        {/* Caption & Institutional Attribution at Bottom of Media Viewport */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white z-10 pointer-events-none">
          <div className="max-w-3xl">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sandstone">
              {activeItem.yearOrPeriod || "Living Cultural Heritage"}
            </span>
            <h4 className="mt-1 font-serif text-lg sm:text-2xl font-bold text-white drop-shadow-sm leading-tight">
              {activeItem.title}
            </h4>
            <p className="mt-1.5 text-support text-white/90 line-clamp-2 leading-relaxed font-light">
              {activeItem.description}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 pointer-events-auto">
              <a
                href={activeItem.institutionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-meta font-medium text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
              >
                <span>Archived by {activeItem.institution}</span>
                <IconExternal width={11} height={11} />
              </a>
              <span className="text-meta text-white/60">
                License: {activeItem.licenseLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails Scrubber Bar */}
      {filteredItems.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto p-3 sm:p-4 bg-surface-2 border-t border-border/60 scrollbar-none">
          {filteredItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                setIsZoomed(false);
              }}
              className={cx(
                "relative aspect-[16/10] w-24 sm:w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer shadow-2xs",
                activeIndex === idx
                  ? "border-gold ring-2 ring-gold/40 scale-102"
                  : "border-border/80 opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={item.thumbnailSrc || item.src}
                alt={item.title}
                fill
                sizes="128px"
                className="object-cover"
              />
              {item.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold">
                  ▶
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
