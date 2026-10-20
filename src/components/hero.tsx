import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ImageRef } from "@/lib/db/schema";
import { IconBack } from "./icons";

/**
 * Full-bleed photo header with a round frosted back button and the title over a scrim
 * (cinematic theme). Without a rights-cleared image it falls back to a tonal panel.
 */
export function PhotoHero({
  image,
  back,
  eyebrow,
  title,
  children,
  lang,
}: {
  image: ImageRef | null | undefined;
  back?: { href: string; label: string };
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  lang?: string;
}) {
  return (
    <header className="relative isolate -mx-4 overflow-hidden sm:mx-0 sm:rounded-lg">
      {image ? (
        <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 960px, 100vw" className="-z-10 object-cover" />
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_15%_0%,#3a2e26_0%,#161819_60%)]" aria-hidden="true" />
      )}
      <div className="scrim absolute inset-0 -z-10" aria-hidden="true" />
      <div className="flex min-h-[440px] flex-col justify-between p-5 md:min-h-[480px] md:p-8">
        <div className="flex items-start justify-between gap-3">
          {back ? (
            <Link href={back.href} aria-label={back.label} title={back.label} className="glass flex size-12 items-center justify-center rounded-full text-white hover:bg-white/10">
              <IconBack width={22} height={22} />
            </Link>
          ) : (
            <span />
          )}
          {image && !image.rightsCleared && <p className="max-w-48 text-right text-[11px] leading-snug text-white/55">{image.credit}</p>}
        </div>
        <div lang={lang}>
          {eyebrow && <p className="text-meta font-semibold uppercase tracking-[0.14em] text-white/75">{eyebrow}</p>}
          <h1 className="mt-2 max-w-2xl text-page font-semibold leading-tight text-white md:text-display">{title}</h1>
          {children && <div className="mt-3 max-w-xl text-support text-white/80">{children}</div>}
        </div>
      </div>
    </header>
  );
}

/** Horizontal row of small fact pills under a hero (sections, sources, language…). */
export function FactPills({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <ul className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4">
      {items.map((i) => (
        <li key={i.label} className="shrink-0 rounded-md border border-border bg-surface px-4 py-2.5">
          <p className="text-meta text-muted">{i.label}</p>
          <p className="mt-0.5 inline-block rounded-full bg-surface-2 px-2.5 py-0.5 text-meta font-semibold text-charcoal">{i.value}</p>
        </li>
      ))}
    </ul>
  );
}
