"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Resilient error boundary: explain, preserve session state, offer retry */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(JSON.stringify({ level: "error", event: "page.error", digest: error.digest ?? null }));
  }, [error]);

  return (
    <div className="mx-auto mt-20 max-w-lg px-4 text-center" role="alert">
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-error/10 text-error">
          <span className="font-serif text-lg font-bold">!</span>
        </div>
        <p className="mt-4 text-meta font-semibold uppercase tracking-[0.16em] text-terracotta">
          Service Resilience
        </p>
        <h1 className="mt-2 font-serif text-page font-semibold text-charcoal">
          Something interrupted the view
        </h1>
        <p className="mt-2 text-support text-secondary-text leading-relaxed">
          We couldn&apos;t load this section right now. Your exploration and session progress are preserved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-surface px-6 text-support font-semibold text-charcoal hover:bg-surface-2 shadow-2xs transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
