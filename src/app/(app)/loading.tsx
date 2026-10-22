/** Loading state: cultural editorial progression with subtle emblem animation */
export default function Loading() {
  return (
    <div
      className="mx-auto mt-20 flex max-w-md flex-col items-center justify-center p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex size-14 items-center justify-center rounded-full border border-forest/20 bg-surface shadow-xs">
        <span className="size-8 animate-spin rounded-full border-2 border-forest/30 border-t-forest" aria-hidden="true" />
        <span className="absolute font-serif text-sm font-semibold text-terracotta">✦</span>
      </div>
      <p className="mt-4 font-serif text-support font-semibold text-charcoal">
        Consulting living cultural archives…
      </p>
      <p className="mt-1 text-meta text-muted">
        Grounded in verified statutory research and heritage collections.
      </p>
    </div>
  );
}
