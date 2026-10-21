import Image from "next/image";
import Link from "next/link";
import type { ImageRef } from "@/lib/db/schema";
import { IconArrow, IconConnect } from "./icons";
import { cx, FixtureBadge } from "./ui";

/** Tall photo card with the name over a scrim and a frosted badge (cinematic theme). */
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
    <Link href={href} className={cx("group relative block aspect-[3/4] overflow-hidden rounded-lg bg-surface border border-border/80 shadow-md", className)}>
      {image ? (
        <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 70vw" className="object-cover transition-transform duration-500 group-hover:scale-105" priority={priority} />
      ) : (
        // No rights-cleared image yet: a tonal charcoal panel rather than unrelated stock imagery.
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_10%,#26221c_0%,#111111_60%)]" aria-hidden="true" />
      )}
      <div className="scrim absolute inset-0" aria-hidden="true" />
      {badge && <span className="glass absolute right-3 top-3 rounded-full px-3 py-1 text-meta font-semibold text-charcoal">{badge}</span>}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-section font-semibold text-white">{name}</h3>
        {tagline && <p className="mt-1 text-support text-white/80">{tagline}</p>}
        {taglineNote && <p className="mt-1 text-meta italic text-white/65">{taglineNote}</p>}
        {meta && <p className="mt-2 text-meta font-semibold text-gold">{meta}</p>}
        {image && !image.rightsCleared && <p className="mt-1 text-[11px] leading-snug text-white/55">{image.credit}</p>}
      </div>
    </Link>
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
    <Link href={href} className="group block rounded-md border border-border bg-surface p-5 transition-all hover:border-gold/50 hover:bg-surface-2 shadow-xs">
      {eyebrow && <p className="text-meta font-semibold uppercase tracking-[0.14em] text-gold">{eyebrow}</p>}
      <h3 className="mt-1 font-serif text-card font-semibold text-charcoal group-hover:text-gold transition-colors">{title}</h3>
      <p className="mt-1.5 text-support text-muted leading-relaxed">{summary}</p>
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {meta && <span className="rounded-full border border-border bg-elevated px-3 py-1 text-meta text-secondary-text">{meta}</span>}
        {languageNote && <span className="text-meta text-muted">{languageNote}</span>}
        {fixtureLabel && <FixtureBadge label={fixtureLabel} />}
        <IconArrow width={18} height={18} className="ml-auto text-gold/70 transition-transform group-hover:translate-x-1 group-hover:text-gold" />
      </div>
    </Link>
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
    <Link
      href={href}
      className={cx(
        "group relative block overflow-hidden rounded-lg border p-5 transition-all md:p-6",
        featured
          ? "border-gold/40 bg-gradient-to-br from-[#1c1a17] via-[#161513] to-[#111110] shadow-md hover:border-gold/80"
          : "border-border bg-surface hover:border-gold/50 hover:bg-surface-2 shadow-xs",
      )}
    >
      <div className="flex items-center gap-2 text-meta font-semibold text-gold">
        <IconConnect width={18} height={18} />
        {typeLabel}
      </div>
      <h3 className="mt-2 font-serif text-card font-semibold text-charcoal md:text-section">{title}</h3>
      <p className="mt-1.5 text-support text-muted leading-relaxed">{summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span
          className={cx(
            "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-support font-semibold transition-colors",
            featured ? "bg-forest text-on-forest group-hover:bg-forest-hover shadow-sm" : "bg-elevated border border-border text-charcoal group-hover:bg-forest group-hover:text-on-forest",
          )}
        >
          {cta} <IconArrow width={16} height={16} />
        </span>
        {fixtureLabel && <FixtureBadge label={fixtureLabel} />}
      </div>
    </Link>
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
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-surface p-5 transition-all hover:border-gold/50 hover:bg-surface-2 hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between text-meta font-semibold uppercase tracking-wider text-gold">
          <span>{category}</span>
          {count && <span className="rounded-full bg-elevated border border-border/80 px-2.5 py-0.5 text-[11px] text-muted">{count}</span>}
        </div>
        <h3 className="mt-2 font-serif text-section font-semibold text-charcoal group-hover:text-gold transition-colors">{title}</h3>
        <p className="mt-1.5 text-support text-muted leading-snug">{subtitle}</p>
      </div>
      <div className="mt-5 flex items-center gap-1 text-meta font-semibold text-gold">
        <span>Explore theme</span>
        <IconArrow width={14} height={14} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

