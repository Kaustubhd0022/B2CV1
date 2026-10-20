"use client";

import { useRef } from "react";
import { IconSearch, IconSend } from "./icons";

/**
 * Question composer (Design §5E). A plain GET form to /ask so it works without JS;
 * Enter submits, Shift+Enter adds a line. `variant="hero"` is the frosted search pill
 * used over imagery on Home.
 */
export function QuestionComposer({
  label,
  hint,
  placeholder,
  languageNote,
  submitLabel,
  defaultValue,
  context,
  variant = "card",
}: {
  label: string;
  hint?: string;
  placeholder: string;
  languageNote: string;
  submitLabel: string;
  defaultValue?: string;
  context?: string;
  variant?: "card" | "hero";
}) {
  const form = useRef<HTMLFormElement>(null);
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      form.current?.requestSubmit();
    }
  };

  if (variant === "hero") {
    return (
      <form ref={form} action="/ask" method="get">
        {context && <input type="hidden" name="context" value={context} />}
        <div className="glass flex items-center gap-3 rounded-full py-2 pl-5 pr-2">
          <IconSearch width={22} height={22} className="shrink-0 text-white/80" />
          <div className="min-w-0 flex-1">
            <label htmlFor="composer-q" className="block text-support font-semibold text-white">
              {label}
            </label>
            <textarea
              id="composer-q"
              name="q"
              rows={1}
              minLength={3}
              maxLength={500}
              required
              defaultValue={defaultValue}
              placeholder={placeholder}
              className="block w-full resize-none overflow-hidden bg-transparent text-meta text-white/90 placeholder:text-white/60 focus:outline-none"
              onKeyDown={onKeyDown}
            />
          </div>
          <button type="submit" className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-forest text-on-forest hover:bg-forest-hover" aria-label={submitLabel}>
            <IconSend width={20} height={20} />
          </button>
        </div>
        <p className="mt-2 pl-5 text-meta text-white/70">{languageNote}</p>
      </form>
    );
  }

  return (
    <form ref={form} action="/ask" method="get" className="rounded-lg border border-border bg-surface p-4 md:p-5">
      <label htmlFor="composer-q" className="block text-card font-semibold text-charcoal">
        {label}
      </label>
      {hint && <p className="mt-1 text-support text-muted">{hint}</p>}
      {context && <input type="hidden" name="context" value={context} />}
      <div className="mt-3 flex items-end gap-2">
        <textarea
          id="composer-q"
          name="q"
          rows={2}
          minLength={3}
          maxLength={500}
          required
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="block min-h-14 w-full resize-y rounded-md border border-border bg-canvas px-4 py-3 text-body placeholder:text-muted/80"
          onKeyDown={onKeyDown}
        />
        <button type="submit" className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-forest text-on-forest hover:bg-forest-hover" aria-label={submitLabel}>
          <IconSend width={20} height={20} />
        </button>
      </div>
      <p className="mt-2 text-meta text-muted">{languageNote}</p>
    </form>
  );
}
