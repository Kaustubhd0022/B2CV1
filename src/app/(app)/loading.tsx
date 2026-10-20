/** Loading state: describes what is loading without fabricated placeholder content. */
export default function Loading() {
  return (
    <div className="mx-auto mt-16 flex max-w-lg items-center justify-center gap-3 px-4 text-support text-muted" role="status" aria-live="polite">
      <span className="size-5 animate-spin rounded-full border-2 border-forest border-r-transparent" aria-hidden="true" />
      Loading…
    </div>
  );
}
