import Link from "next/link";
import { IconExplore } from "./icons";

interface StoryMiniMapProps {
  cityName: string;
  citySlug: string;
  coordinates?: { lat: number; lng: number };
  tagline?: string;
}

export function StoryMiniMap({
  cityName,
  citySlug,
  coordinates,
  tagline,
}: StoryMiniMapProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <span className="text-meta font-semibold uppercase tracking-wider text-gold">
          Geographical Context
        </span>
        {coordinates && (
          <span className="font-mono text-[11px] text-muted">
            {coordinates.lat.toFixed(2)}°N, {coordinates.lng.toFixed(2)}°E
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-serif text-lg font-semibold text-charcoal">{cityName}</h3>
        {tagline && (
          <p className="mt-1 text-meta text-muted leading-relaxed line-clamp-2">
            {tagline}
          </p>
        )}
      </div>

      {/* Stylized schematic thumbnail */}
      <div className="mt-3.5 relative h-28 overflow-hidden rounded-xl border border-border bg-[#14110e] flex items-center justify-center">
        <div className="absolute inset-0 opacity-25">
          <svg viewBox="0 0 200 100" className="w-full h-full object-cover">
            <path d="M 0 50 Q 100 20 200 50" stroke="#D6B36A" strokeWidth="2" fill="none" />
            <circle cx="100" cy="35" r="4" fill="#D6B36A" />
            <circle cx="100" cy="35" r="10" stroke="#D6B36A" strokeWidth="1" fill="none" opacity="0.5" />
          </svg>
        </div>
        <div className="relative z-10 text-center">
          <span className="rounded-full bg-gold/15 border border-gold/40 px-3 py-1 text-[11px] font-semibold text-gold backdrop-blur-xs">
            {cityName} Cultural Ecosystem
          </span>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={`/places?city=${citySlug}`}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 text-meta font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
        >
          <IconExplore className="size-4 shrink-0 text-white" />
          <span>Explore on Cultural Atlas →</span>
        </Link>
      </div>
    </div>
  );
}
