"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PlaceDetail } from "@/lib/data/pilot-places";
import { IconExternal, IconShare } from "./icons";
import { FadeIn } from "./motion";

export function PlaceDetailPanel({
  place,
  onClose,
  isMobileDrawer = false,
}: {
  place: PlaceDetail;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"about" | "architecture" | "rituals">("about");
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/places?city=${place.citySlug}&place=${place.id}`;
      if (navigator.share) {
        navigator.share({
          title: `${place.name} · TattvaCo Cultural Discovery`,
          text: place.subtitle,
          url: shareUrl,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <aside
      className={`min-w-0 flex flex-col bg-surface border border-border/80 shadow-md ${
        isMobileDrawer
          ? "w-full max-h-[85vh] rounded-t-3xl overflow-y-auto"
          : "rounded-2xl overflow-hidden h-full max-h-[calc(100vh-140px)] overflow-y-auto"
      }`}
      aria-label={`Detailed cultural overview of ${place.name}`}
    >
      {/* Mobile Drawer Header with Close Button */}
      {isMobileDrawer && (
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-surface/95 px-5 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-meta font-semibold uppercase tracking-wider text-gold">Place Inspection</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-elevated border border-border p-1.5 text-muted hover:text-charcoal hover:bg-surface-2 transition-colors"
              aria-label="Close place details"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Hero Image with Badge */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone">
        <Image
          src={place.image}
          alt={place.name}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />
        
        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="rounded-full bg-canvas/85 border border-gold/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold backdrop-blur-md">
            {place.typeLabel} · {place.period.split(" ")[0]}
          </span>
        </div>

        {/* Desktop Close button if overlay */}
        {!isMobileDrawer && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full bg-canvas/80 border border-border/70 p-1.5 text-muted hover:text-charcoal hover:bg-canvas transition-colors"
            aria-label="Close panel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        {/* Title Overlay at base of image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal leading-tight drop-shadow-sm">
            {place.name}
          </h2>
          <p className="text-meta text-secondary-text line-clamp-1 mt-0.5">
            {place.subtitle}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Action Button Row */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${place.name}, ${place.cityName}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 text-meta font-medium text-charcoal hover:bg-surface hover:border-gold/40 transition-colors"
          >
            <IconExternal width={13} height={13} />
            <span>Maps</span>
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 text-meta font-medium text-charcoal hover:bg-surface hover:border-gold/40 transition-colors"
          >
            <IconShare width={13} height={13} />
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>

          {/* Non-persistent session bookmark */}
          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border text-meta font-medium transition-colors ${
              isSaved
                ? "border-gold bg-gold/15 text-gold font-semibold"
                : "border-border bg-surface-2 text-charcoal hover:bg-surface hover:border-gold/40"
            }`}
            title="Transient session save (per scope constraints, persistent library is not enabled)"
          >
            <span>{isSaved ? "★ Saved" : "☆ Save"}</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border/80">
          {(
            [
              { id: "about", label: "About" },
              { id: "architecture", label: "Architecture" },
              { id: "rituals", label: "Rituals & Culture" },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 pb-2.5 text-center text-support font-semibold transition-all relative ${
                  active
                    ? "text-gold"
                    : "text-muted hover:text-charcoal"
                }`}
              >
                {tab.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        {activeTab === "about" && (
          <FadeIn duration={0.25} y={6} className="space-y-5">
            {/* About Narrative */}
            <div className="space-y-2.5 text-support text-secondary-text leading-relaxed">
              {place.about.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Key Attributes 2x2 Grid matching Reference Page 8 */}
            <div className="rounded-xl border border-border/80 bg-surface-2/60 p-4 space-y-3">
              <h3 className="text-meta font-semibold uppercase tracking-wider text-gold">
                Key Cultural Attributes
              </h3>
              <div className="grid grid-cols-2 gap-3 text-meta">
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">Deity / Subject</span>
                  <p className="font-medium text-charcoal leading-snug">{place.deityOrSubject}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">Significance</span>
                  <p className="font-medium text-charcoal leading-snug">{place.significance}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">Location</span>
                  <p className="font-medium text-charcoal leading-snug">{place.location}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">Period / Builder</span>
                  <p className="font-medium text-charcoal leading-snug">{place.period}</p>
                </div>
              </div>
            </div>

            {/* Photo Gallery Thumbnail Strip */}
            {place.gallery && place.gallery.length > 0 && (
              <div className="space-y-2">
                <span className="text-meta font-semibold uppercase tracking-wider text-gold">Visual Archives</span>
                <div className="grid grid-cols-3 gap-2">
                  {place.gallery.map((imgUrl, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-stone">
                      <Image
                        src={imgUrl}
                        alt={`${place.name} perspective ${i + 1}`}
                        fill
                        sizes="100px"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Heritage Places */}
            {place.nearby && place.nearby.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-meta font-semibold uppercase tracking-wider text-gold">Nearby Cultural Sites</span>
                <ul className="space-y-2">
                  {place.nearby.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-2/40 px-3 py-2 text-meta"
                    >
                      <div>
                        <span className="font-semibold text-charcoal">{item.name}</span>
                        <span className="ml-2 text-[11px] text-muted">({item.type})</span>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/25">
                        {item.distance}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </FadeIn>
        )}

        {activeTab === "architecture" && (
          <FadeIn duration={0.25} y={6} className="space-y-4">
            <div className="rounded-xl border border-border/80 bg-surface-2/60 p-4 space-y-2">
              <span className="text-meta font-semibold uppercase tracking-wider text-gold">Architecture Style</span>
              <p className="font-serif text-support font-semibold text-charcoal">{place.architectureStyle}</p>
            </div>
            <div className="text-support text-secondary-text leading-relaxed">
              <p>{place.architectureNotes}</p>
            </div>
            <div className="border-t border-border/70 pt-3">
              <span className="text-meta font-semibold uppercase tracking-wider text-gold">Spatial Geometry</span>
              <p className="mt-1 text-meta text-muted leading-relaxed">
                Coordinates: {place.coordinates.lat.toFixed(4)}° N, {place.coordinates.lng.toFixed(4)}° E. Grounded in sacred geometric proportioning described in the Shilpa Shastras and Manasara treatises.
              </p>
            </div>
          </FadeIn>
        )}

        {activeTab === "rituals" && (
          <FadeIn duration={0.25} y={6} className="space-y-4">
            <div className="text-support text-secondary-text leading-relaxed">
              <p>{place.ritualsAndCulture}</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-surface-2/60 p-4 space-y-2">
              <span className="text-meta font-semibold uppercase tracking-wider text-gold">Visitor Cultural Etiquette</span>
              <ul className="text-meta text-muted space-y-1.5 list-disc list-inside">
                <li>Remove footwear before entering the temple sanctum or ghat pavilions.</li>
                <li>Dress modestly covering shoulders and knees out of respect for sacred rituals.</li>
                <li>Photography may be restricted inside the inner garbhagriha.</li>
                <li>Early morning (sunrise) offers the most serene atmosphere for contemplation.</li>
              </ul>
            </div>
          </FadeIn>
        )}

        {/* Persistent Discovery Gateways: Related Flagship Story & Ask AI */}
        <div className="space-y-3 pt-3 border-t border-border/70">
          {place.relatedStorySlug && (
            <div className="rounded-xl border border-[#F0DCE4] bg-white/90 backdrop-blur-xs p-4 shadow-xs space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <span>✦</span> Related Flagship Story
              </span>
              <h4 className="font-serif text-support font-semibold text-[#20101B] leading-snug">
                {place.relatedStoryTitle}
              </h4>
              <div className="pt-1">
                <Link
                  href={`/stories/${place.relatedStorySlug}`}
                  className="inline-flex items-center gap-1 text-meta font-semibold text-amber-700 hover:text-[#20101B] hover:underline"
                >
                  Read Complete Curated Story →
                </Link>
              </div>
            </div>
          )}

          <Link
            href={`/ask?q=${encodeURIComponent(
              `Tell me about the history, architectural significance, and spiritual heritage of ${place.name} in ${place.cityName}`,
            )}`}
            className="w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest px-4 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
          >
            <span>✦</span>
            <span>Ask TattvaCo AI About This Site</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
