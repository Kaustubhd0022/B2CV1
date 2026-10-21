import Image from "next/image";
import Link from "next/link";
import type { ImageRef } from "@/lib/db/schema";
import { MotionCard } from "./motion";
import { IconArrow, IconConnect } from "./icons";
import { cx, FixtureBadge } from "./ui";

/** Tall photo card with editorial typography over a warm scrim (Living Heritage system). */
export function CityCard({
  href,
  name,
  tagline,
  image,
  meta,
  badge,
  taglineNote,
  priority,
  className,
}: {
  href: string;
  name: string;
  tagline?: string;
  image: ImageRef | null;
  meta?: string;
  badge?: string;
  taglineNote?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <MotionCard className="h-full">
      <Link
        href={href}
        className={cx(
          "group relative block h-full aspect-[3/4] overflow-hidden rounded-2xl bg-stone border border-border/80 shadow-2xs transition-all duration-300 hover:shadow-lg",
          className,
        )}
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 75vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#e7ddca] via-[#dfd7c7] to-[#d4c9b5]" aria-hidden="true" />
        )}
        <div className="scrim absolute inset-0" aria-hidden="true" />
        {badge && (
          <span className="glass-white absolute right-3.5 top-3.5 rounded-full px-3 py-1 text-[11px] font-semibold text-forest shadow-2xs">
            {badge}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-serif text-section lg:text-section-lg font-semibold text-white tracking-tight">{name}</h3>
          {tagline && <p className="mt-1 text-support text-white/90 line-clamp-2 leading-snug">{tagline}</p>}
          {taglineNote && <p className="mt-1 text-[11px] italic text-white/70">{taglineNote}</p>}
          {meta && (
            <p className="mt-2 text-meta font-medium text-sandstone flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-terracotta" />
              {meta}
            </p>
          )}
          {image && !image.rightsCleared && <p className="mt-1.5 text-[10px] leading-tight text-white/60">{image.credit}</p>}
        </div>
      </Link>
    </MotionCard>
  );
}

export function StoryCard({
  href,
  eyebrow,
  title,
  summary,
  meta,
  fixtureLabel,
  languageNote,
}: {
  href: string;
  eyebrow?: string;
  title: string;
  summary: string;
  meta?: string;
  fixtureLabel?: string;
  languageNote?: string;
}) {
  return (
    <MotionCard className="h-full">
      <Link
        href={href}
        className="group flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-surface p-6 shadow-2xs transition-all duration-300 hover:border-forest/40 hover:shadow-md"
      >
        <div>
          {eyebrow && <p className="text-meta font-semibold uppercase tracking-[0.16em] text-terracotta">{eyebrow}</p>}
          <h3 className="mt-1.5 font-serif text-card md:text-section font-semibold text-charcoal group-hover:text-forest transition-colors tracking-tight">
            {title}
          </h3>
          <p className="mt-2 text-support text-secondary-text leading-relaxed line-clamp-3">{summary}</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3.5">
          {meta && (
            <span className="rounded-full border border-border bg-surface-2 px-3 py-0.5 text-meta font-medium text-secondary-text">
              {meta}
            </span>
          )}
          {languageNote && <span className="text-meta text-muted">{languageNote}</span>}
          {fixtureLabel && <FixtureBadge label={fixtureLabel} />}
          <span className="ml-auto inline-flex items-center gap-1 text-meta font-semibold text-forest transition-transform group-hover:translate-x-1">
            Read story <IconArrow width={16} height={16} />
          </span>
        </div>
      </Link>
    </MotionCard>
  );
}

export function ConnectionCard({
  href,
  title,
  summary,
  typeLabel,
  cta,
  fixtureLabel,
  featured,
}: {
  href: string;
  title: string;
  summary: string;
  typeLabel?: string;
  cta: string;
  fixtureLabel?: string;
  featured?: boolean;
}) {
  return (
    <MotionCard>
      <Link
        href={href}
        className={cx(
          "group relative block overflow-hidden rounded-2xl border p-6 transition-all duration-300 md:p-8",
          featured
            ? "border-forest/40 bg-gradient-to-br from-[#173D32] via-[#1A4438] to-[#122F26] text-white shadow-md hover:shadow-lg"
            : "border-border bg-surface hover:border-forest/40 hover:shadow-md shadow-2xs",
        )}
      >
        <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider">
          <IconConnect width={18} height={18} className={featured ? "text-sandstone" : "text-terracotta"} />
          <span className={featured ? "text-sandstone" : "text-terracotta"}>{typeLabel}</span>
        </div>
        <h3 className={cx("mt-2.5 font-serif text-section font-semibold tracking-tight md:text-section-lg", featured ? "text-white" : "text-charcoal")}>
          {title}
        </h3>
        <p className={cx("mt-2 text-support leading-relaxed", featured ? "text-white/85" : "text-secondary-text")}>
          {summary}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className={cx(
              "inline-flex min-h-10 items-center gap-2 rounded-full px-5 text-support font-semibold transition-all duration-200",
              featured
                ? "bg-white text-forest shadow-xs group-hover:bg-sandstone"
                : "bg-forest text-on-forest group-hover:bg-forest-hover shadow-xs",
            )}
          >
            {cta} <IconArrow width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
          </span>
          {fixtureLabel && <FixtureBadge label={fixtureLabel} onDark={featured} />}
        </div>
      </Link>
    </MotionCard>
  );
}

export function ThematicCard({
  href,
  title,
  subtitle,
  category,
  count,
  imageSrc,
}: {
  href: string;
  title: string;
  subtitle: string;
  category: string;
  count?: string;
  imageSrc?: string;
}) {
  return (
    <MotionCard className="h-full">
      <Link
        href={href}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface p-6 shadow-2xs transition-all duration-300 hover:border-forest/40 hover:shadow-md"
      >
        <div>
          <div className="flex items-center justify-between text-meta font-semibold uppercase tracking-wider text-terracotta">
            <span>{category}</span>
            {count && (
              <span className="rounded-full bg-surface-2 border border-border/80 px-2.5 py-0.5 text-[11px] font-medium text-secondary-text">
                {count}
              </span>
            )}
          </div>
          <h3 className="mt-2.5 font-serif text-card md:text-section font-semibold text-charcoal group-hover:text-forest transition-colors tracking-tight">
            {title}
          </h3>
          <p className="mt-1.5 text-support text-secondary-text leading-relaxed">{subtitle}</p>
        </div>
        <div className="mt-6 flex items-center gap-1.5 text-meta font-semibold text-forest group-hover:text-forest-hover">
          <span>Explore dimension</span>
          <IconArrow width={14} height={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </MotionCard>
  );
}

