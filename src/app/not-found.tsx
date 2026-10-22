import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto mt-20 max-w-xl px-4 text-center" role="status">
      <div className="rounded-3xl border border-gold/25 bg-gradient-to-br from-[#171512] via-[#1a1714] to-[#12100d] p-8 sm:p-12 shadow-md">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface border border-gold/40 text-gold shadow-xs">
          <span className="font-serif text-lg">✦</span>
        </div>
        <p className="mt-4 text-meta font-semibold uppercase tracking-[0.16em] text-gold">
          Uncharted Pathway · 404
        </p>
        <h1 className="mt-2 font-serif text-page font-semibold text-charcoal md:text-page-lg">
          We couldn&apos;t find that cultural record
        </h1>
        <p className="mt-3 text-body text-secondary-text leading-relaxed">
          The link may have moved or the item has not yet been documented in this pilot edition. Your exploration is safe.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
          >
            Return to Discovery →
          </Link>
          <Link
            href="/explore"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-surface px-6 text-support font-semibold text-charcoal hover:bg-surface-2 shadow-2xs transition-colors"
          >
            Browse Collections
          </Link>
        </div>
      </div>
    </main>
  );
}
