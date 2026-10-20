"use client";

import Link from "next/link";
import { useEffect } from "react";

/** ST03 service failure: explain, keep the user's place, offer retry. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(JSON.stringify({ level: "error", event: "page.error", digest: error.digest ?? null }));
  }, [error]);
  return (
    <div className="mx-auto mt-16 max-w-lg px-4 text-center" role="alert">
      <h1 className="font-serif text-page font-semibold">Something went wrong</h1>
      <p className="mt-2 text-support text-muted">We couldn&apos;t load this page. Your exploration has not been lost.</p>
      <div className="mt-6 flex justify-center gap-2">
        <button onClick={reset} className="inline-flex min-h-11 items-center rounded-md bg-forest px-5 font-semibold text-on-forest">
          Try again
        </button>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-md border border-forest px-5 font-semibold text-forest">
          Home
        </Link>
      </div>
    </div>
  );
}
