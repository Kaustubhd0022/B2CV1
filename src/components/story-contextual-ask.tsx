import Link from "next/link";

interface ContextualAskProps {
  question: string;
  contextRef: string;
  topic?: string;
}

export function StoryContextualAsk({
  question,
  contextRef,
  topic = "Curious about this historical transition?",
}: ContextualAskProps) {
  return (
    <div className="my-8 rounded-2xl border border-gold/30 bg-gradient-to-r from-[#171411] via-[#1c1814] to-[#14120f] p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold">
            <span>✦</span>
            <span>{topic}</span>
          </div>
          <p className="font-serif text-support font-semibold text-charcoal sm:text-base leading-snug">
            &ldquo;{question}&rdquo;
          </p>
        </div>

        <Link
          href={`/ask?q=${encodeURIComponent(question)}&context=${encodeURIComponent(contextRef)}`}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-forest px-4 py-1.5 text-meta font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors shrink-0"
        >
          <span>Ask TattvaCo AI</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
