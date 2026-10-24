"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AskResult } from "@/lib/ai/types";
import { makeClientT, type ClientT } from "@/lib/i18n/client-t";
import { FadeIn } from "@/components/motion";
import { IconExternal, IconFlag } from "@/components/icons";
import { Button, EpistemicLabel, FixtureBadge, Notice } from "@/components/ui";

type Stage = "understanding" | "retrieving" | "composing" | "checking";
type Turn = {
  id: number;
  question: string;
  state: "loading" | "done" | "error";
  stage?: Stage;
  result?: AskResult;
  error?: "service_failure" | "rate_limited" | "too_short" | "too_long" | "network";
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  bn: "বাংলা",
  ta: "தமிழ்",
  mr: "मराठी",
  te: "తెలుగు",
  gu: "ગુજરાતી",
  pa: "ਪੰਜਾਬੀ",
  or: "ଓଡ଼ିଆ",
};

const CURATED_PROMPTS = [
  "Why does Varanasi have 84 ghats?",
  "How are Banarasi silks tied to the Ganga?",
  "What connects Hampi to Madurai?",
  "What is the sacred geometry of the Panchakroshi yatra?",
  "Why did Sawai Jai Singh build stone observatories?",
];

export function AskClient({
  messages,
  lang,
  initialQuestion,
  context,
}: {
  messages: Record<string, string>;
  lang: string;
  initialQuestion?: string;
  context?: string;
}) {
  const t = makeClientT(messages);
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const started = useRef(false);
  const busy = turns.some((x) => x.state === "loading");
  const bottom = useRef<HTMLDivElement>(null);

  const ask = useCallback(
    async (question: string, opts: { replaceId?: number } = {}) => {
      const q = question.replace(/\s+/g, " ").trim();
      if (q.length < 3) return setInputError(t("ask.tooShort"));
      if (q.length > 500) return setInputError(t("ask.tooLong"));
      setInputError(null);
      const id = opts.replaceId ?? Date.now();
      const update = (patch: Partial<Turn>) =>
        setTurns((all) => all.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      setTurns((all) =>
        opts.replaceId
          ? all.map((x) => (x.id === id ? { id, question: q, state: "loading" } : x))
          : [...all, { id, question: q, state: "loading" }],
      );
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, context }),
        });
        if (res.status === 401) {
          router.push(
            `/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}&reason=expired`,
          );
          return;
        }
        if (!res.ok || !res.body) {
          const body = await res.json().catch(() => ({}));
          return update({
            state: "error",
            error:
              body.error === "rate_limited"
                ? "rate_limited"
                : body.error === "too_long"
                ? "too_long"
                : body.error === "too_short"
                ? "too_short"
                : "service_failure",
          });
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl);
            buf = buf.slice(nl + 1);
            if (!line.trim()) continue;
            const msg = JSON.parse(line);
            if (msg.type === "stage") update({ stage: msg.stage });
            else if (msg.type === "result") {
              update({ state: "done", result: msg.result });
              try {
                sessionStorage.setItem(`tc_answer_${msg.result.runId}`, JSON.stringify(snapshot(q, msg.result)));
              } catch {
                /* storage unavailable */
              }
            } else if (msg.type === "error") update({ state: "error", error: "service_failure" });
          }
        }
      } catch {
        update({ state: "error", error: "network" });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context, router],
  );

  useEffect(() => {
    if (initialQuestion && !started.current) {
      started.current = true;
      void ask(initialQuestion);
    }
  }, [initialQuestion, ask]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length]);

  async function newTopic() {
    await fetch("/api/ask", { method: "DELETE" }).catch(() => {});
    setTurns([]);
    setDraft("");
    setInputError(null);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !draft.trim()) return;
    void ask(draft);
    setDraft("");
  };

  return (
    <div className="w-full">
      {/* Copilot Window Card matching 21st.dev rose/plum theme */}
      <div className="relative mx-auto w-full max-w-5xl rounded-[2.5rem] border border-[#F0DCE4] bg-white/95 backdrop-blur-md shadow-2xl shadow-[#24131E]/5 overflow-hidden text-[#20101B]">
        {/* Copilot Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0DCE4] bg-[#FFF5F8]/80 px-6 py-4 sm:px-8">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-[#24131E] text-white shadow-xs">
              <span className="text-sm font-bold">✦</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-xs font-bold tracking-[0.18em] uppercase text-[#20101B]">
                TATTVACO
              </span>
              <span className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-[#705664]">
                ASSIST
              </span>
            </div>
          </div>

          {/* Center Segmented Tabs */}
          <div className="flex items-center gap-1 rounded-full border border-[#F0DCE4] bg-[#FAF0F4] p-1 shadow-xs">
            <Link
              href="/places"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-[#5A4450] hover:text-[#20101B] hover:bg-white/80 transition-all flex items-center gap-1.5"
            >
              <span className="text-xs">🏛</span>
              <span className="hidden sm:inline">Cultural Atlas</span>
            </Link>
            <Link
              href="/explore"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-[#5A4450] hover:text-[#20101B] hover:bg-white/80 transition-all flex items-center gap-1.5"
            >
              <span className="text-xs">📜</span>
              <span className="hidden sm:inline">Stories</span>
            </Link>
            <button
              type="button"
              className="rounded-full bg-[#24131E] px-3.5 py-1 text-xs font-semibold text-white shadow-xs flex items-center gap-1.5"
            >
              <span className="text-xs">✦</span>
              <span>Ask AI</span>
            </button>
          </div>

          {/* Right User Profile / Action Badge */}
          <div className="flex items-center gap-2">
            {turns.length > 0 && (
              <button
                type="button"
                onClick={newTopic}
                disabled={busy}
                className="rounded-full border border-[#F0DCE4] bg-white px-3 py-1 text-xs font-semibold text-[#5A4450] hover:text-[#20101B] hover:bg-[#FAF0F4] transition-all"
              >
                + New Inquiry
              </button>
            )}
            <div className="flex items-center gap-2 rounded-full border border-[#F0DCE4] bg-white px-3 py-1 text-xs font-medium text-[#20101B] shadow-xs">
              <div className="flex size-6 items-center justify-center rounded-full bg-[#FAF0F4] border border-[#F0DCE4] text-[10px] font-bold text-[#24131E]">
                ✦
              </div>
              <span>Explorer ⌵</span>
            </div>
          </div>
        </div>

        {/* Interior Copilot Canvas */}
        {turns.length === 0 ? (
          /* Empty State: Centered Copilot Showcase matching the reference screenshot */
          <div className="relative flex flex-col items-center justify-center px-6 py-16 sm:py-24 sm:px-12 text-center bg-gradient-to-b from-[#FFF8FA] via-[#FFFFFF] to-[#FAF2F6]">
            {/* Center Floating Icon Pill */}
            <div className="flex size-14 items-center justify-center rounded-2xl border border-[#F0DCE4] bg-[#FAF0F4] shadow-xs text-xl text-[#24131E]">
              ✦
            </div>

            {/* Main Headline */}
            <h2 className="mt-6 font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#20101B] tracking-tight">
              What do you want to know, Explorer?
            </h2>

            {/* Subtitle */}
            <p className="mt-3 text-sm sm:text-base text-[#5A4450] max-w-xl leading-relaxed">
              Answers synthesized exclusively from statutory archives, research repositories and verified source material.
            </p>

            {/* Suggestion Question Pills Row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 max-w-2xl">
              {CURATED_PROMPTS.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => void ask(prompt)}
                  disabled={busy}
                  className="rounded-full border border-[#F0DCE4] bg-[#FAF0F4]/80 px-4 py-2 text-xs sm:text-sm font-medium text-[#20101B] hover:bg-white hover:border-[#D9BDC9] hover:shadow-xs transition-all active:scale-[0.98]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Wide Floating Prompt Input Bar */}
            <form
              onSubmit={handleFormSubmit}
              className="w-full max-w-2xl mt-12 rounded-full border border-[#F0DCE4] bg-white p-2 pl-6 shadow-xl flex items-center gap-3 transition-all focus-within:border-[#24131E] focus-within:ring-2 focus-within:ring-[#24131E]/10"
            >
              <span className="text-[#8E7582] text-sm shrink-0">✦</span>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about India's sacred geography, living crafts, or traditions..."
                className="w-full bg-transparent text-sm sm:text-base text-[#20101B] placeholder:text-[#8E7582] focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="size-10 sm:size-11 rounded-full bg-[#24131E] text-white flex items-center justify-center hover:bg-[#381C2E] transition-all disabled:opacity-40 shrink-0 shadow-sm text-base font-bold"
                aria-label="Submit inquiry"
              >
                →
              </button>
            </form>

            {inputError && (
              <p role="alert" className="mt-2 text-meta text-red-600 font-medium">
                {inputError}
              </p>
            )}

            <p className="mt-3 text-meta text-[#8E7582]">
              {t("ask.responseLanguage", { language: LANG_NAMES[lang] ?? lang })} · Synthesized with citations
            </p>
          </div>
        ) : (
          /* Active Conversation State */
          <div className="p-6 sm:p-8 space-y-6">
            <ol className="space-y-6">
              {turns.map((turn) => (
                <li key={turn.id} className="space-y-4">
                  {/* User Question Bubble */}
                  <FadeIn duration={0.3} y={10}>
                    <div className="rounded-2xl border border-[#F0DCE4] bg-[#FAF0F4]/80 p-5 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#705664]">
                        {t("ask.yourQuestion")}
                      </span>
                      <p className="mt-1 font-serif text-lg sm:text-xl font-semibold text-[#20101B]">
                        {turn.question}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Assistant Answer Stream */}
                  <div>
                    {turn.state === "loading" && (
                      <FadeIn duration={0.25} y={8}>
                        <Progress stage={turn.stage} t={t} />
                      </FadeIn>
                    )}

                    {turn.state === "error" && (
                      <FadeIn duration={0.25} y={8}>
                        <Notice
                          tone={turn.error === "rate_limited" ? "warning" : "error"}
                          role="alert"
                          title={turn.error === "rate_limited" ? undefined : t("ask.failureTitle")}
                        >
                          <p>
                            {turn.error === "rate_limited"
                              ? t("ask.rateLimited")
                              : turn.error === "too_long"
                              ? t("ask.tooLong")
                              : turn.error === "too_short"
                              ? t("ask.tooShort")
                              : t("ask.failureBody")}
                          </p>
                          {turn.error !== "rate_limited" && (
                            <Button
                              type="button"
                              variant="secondary"
                              className="mt-3"
                              onClick={() => ask(turn.question, { replaceId: turn.id })}
                            >
                              {t("common.retry")}
                            </Button>
                          )}
                        </Notice>
                      </FadeIn>
                    )}

                    {turn.state === "done" && turn.result && (
                      <FadeIn duration={0.4} y={12}>
                        <Answer
                          result={turn.result}
                          t={t}
                          onRetry={() => ask(turn.question, { replaceId: turn.id })}
                          onAsk={(q) => ask(q)}
                          selected={lang}
                        />
                      </FadeIn>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div ref={bottom} />

            {/* Floating Follow-up Input Bar */}
            <form
              onSubmit={handleFormSubmit}
              className="mt-6 rounded-full border border-[#F0DCE4] bg-[#FAF0F4]/50 p-2 pl-6 shadow-md flex items-center gap-3 transition-all focus-within:bg-white focus-within:border-[#24131E] focus-within:ring-2 focus-within:ring-[#24131E]/10"
            >
              <span className="text-[#8E7582] text-sm shrink-0">✦</span>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("ask.followUp") || "Ask a follow-up cultural inquiry..."}
                className="w-full bg-transparent text-sm sm:text-base text-[#20101B] placeholder:text-[#8E7582] focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="size-10 sm:size-11 rounded-full bg-[#24131E] text-white flex items-center justify-center hover:bg-[#381C2E] transition-all disabled:opacity-40 shrink-0 shadow-sm text-base font-bold"
                aria-label="Submit follow-up"
              >
                →
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function snapshot(question: string, r: AskResult) {
  const answer = [r.summary, ...r.sections.flatMap((s) => [s.heading, ...s.points.map((p) => p.text)])]
    .filter(Boolean)
    .join("\n");
  return {
    question,
    answer: answer.slice(0, 8000),
    sources: [...r.sources, ...r.foundSources].slice(0, 20).map((s) => ({ title: s.title, url: s.url })),
    outcome: r.outcome,
  };
}

function Progress({ stage, t }: { stage?: Stage; t: ClientT }) {
  const stages: Stage[] = ["understanding", "retrieving", "composing", "checking"];
  const idx = stage ? stages.indexOf(stage) : 0;
  return (
    <div className="rounded-2xl border border-[#F0DCE4] bg-white p-5 shadow-xs" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="size-5 animate-spin rounded-full border-2 border-[#24131E] border-r-transparent" aria-hidden="true" />
        <span className="font-serif text-support font-semibold text-[#20101B]">
          {stage ? t(`ask.stages.${stage}`) : t("ask.loading")}
        </span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {stages.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= idx ? "bg-[#24131E]" : "bg-[#FAF0F4]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Markers({ nums, runId, sources }: { nums: number[]; runId: string; sources?: AskResult["sources"] }) {
  const [activeNum, setActiveNum] = useState<number | null>(null);
  if (!nums.length) return null;
  return (
    <span className="relative ml-1 inline-flex items-center gap-1 align-baseline">
      {nums.map((n) => {
        const src = sources?.find((s) => s.n === n);
        const isOpen = activeNum === n;
        return (
          <span key={n} className="relative inline-block">
            <button
              type="button"
              onClick={() => setActiveNum(isOpen ? null : n)}
              onMouseEnter={() => setActiveNum(n)}
              onMouseLeave={() => setActiveNum(null)}
              className="inline-flex min-w-5 h-5 items-center justify-center rounded-md border border-[#F0DCE4] bg-[#FAF0F4] px-1 font-mono text-[11px] font-bold text-[#24131E] hover:bg-[#24131E] hover:text-white transition-colors cursor-pointer"
              aria-label={`Source citation ${n}: ${src?.title || `Citation ${n}`}`}
              aria-expanded={isOpen}
            >
              {n}
            </button>
            {isOpen && src && (
              <span
                role="tooltip"
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 rounded-xl border border-[#F0DCE4] bg-white p-3 text-left shadow-2xl backdrop-blur-md"
              >
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                  Source [{n}] · {src.publisher || "Archival Record"}
                </span>
                <span className="mt-1 block font-serif text-xs font-semibold text-[#20101B] leading-tight">
                  {src.title}
                </span>
                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#24131E] underline hover:text-[#5A4450]"
                  >
                    <span>View primary source</span>
                    <IconExternal width={11} height={11} />
                  </a>
                ) : (
                  <span className="mt-1.5 block text-[10px] text-[#705664] italic">
                    Verified institutional excerpt
                  </span>
                )}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 rotate-45 border-r border-b border-[#F0DCE4] bg-white" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function Answer({
  result: r,
  t,
  onRetry,
  onAsk,
  selected,
}: {
  result: AskResult;
  t: ClientT;
  onRetry: () => void;
  onAsk: (q: string) => void;
  selected: string;
}) {
  const router = useRouter();
  const shown = r.outcome === "routine_approved" || r.outcome === "qualified";

  return (
    <div className="space-y-4">
      {r.detectedLanguage && (
        <Notice>
          {t("ask.languageDetected", {
            language: LANG_NAMES[r.detectedLanguage] ?? r.detectedLanguage,
            selected: LANG_NAMES[selected] ?? selected,
          })}
        </Notice>
      )}
      {r.retrievalIssues.length > 0 && (
        <Notice tone="warning">
          {t("ask.retrievalLimited", { providers: r.retrievalIssues.join(", ") })}
        </Notice>
      )}

      {shown && (
        <article
          className="rounded-[2rem] border border-[#F0DCE4] bg-white p-6 sm:p-8 shadow-sm"
          aria-label={t("ask.response")}
        >
          {/* Direct Synthesis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800">
              <span>✦</span>
              <span>Cultural Knowledge Synthesis</span>
            </div>

            {r.summary && (
              <p className="font-serif text-lg md:text-xl font-medium leading-relaxed text-[#20101B]">
                {r.summary}
                <Markers nums={r.summarySources} runId={r.runId} sources={r.sources} />
              </p>
            )}

            {r.sections.map((s, i) => (
              <section key={i} className="mt-6 pt-4 border-t border-[#F0DCE4]">
                <h3 className="font-serif text-card font-semibold text-[#20101B]">
                  {s.heading || t("ask.context")}
                </h3>
                <ul className="mt-3 space-y-3">
                  {s.points.map((p, j) => (
                    <li key={j} className="text-body text-[#3A2231] leading-relaxed">
                      <EpistemicLabel kind={p.epistemic} label={t(`epistemic.${p.epistemic}`)} />{" "}
                      <span className="ml-1.5">{p.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Institutional Grounding & Sources Panel */}
          <div className="mt-8 rounded-2xl border border-[#F0DCE4] bg-[#FAF0F4]/70 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#F0DCE4] pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#24131E] text-white text-xs font-bold">
                  ✓
                </span>
                <span className="text-support font-semibold text-[#20101B]">
                  {r.outcome === "routine_approved"
                    ? "Verified Cultural Synthesis"
                    : "Qualified Contextual Synthesis"}
                </span>
              </div>
              <span className="text-meta text-[#705664]">
                {r.sources.length} Verified Sources Grounded
              </span>
            </div>

            {/* Sources List */}
            <section aria-labelledby={`sources-${r.runId}`}>
              <h4 id={`sources-${r.runId}`} className="text-meta font-semibold uppercase tracking-wider text-[#705664]">
                {t("ask.sources")}
              </h4>
              <ol className="mt-2.5 space-y-2">
                {r.sources.map((s) => (
                  <li
                    key={s.n}
                    id={`src-${r.runId}-${s.n}`}
                    className="scroll-mt-24 rounded-xl border border-[#F0DCE4] bg-white p-3 target:ring-2 target:ring-[#24131E] text-support"
                  >
                    <SourceLine s={s} t={t} selected={selected} />
                    {s.quotes.length > 0 && (
                      <details className="mt-2 text-meta">
                        <summary className="cursor-pointer font-semibold text-[#24131E] hover:underline">
                          {t("ask.quotesLabel")}
                        </summary>
                        <ul className="mt-1.5 space-y-1">
                          {s.quotes.map((q, i) => (
                            <li
                              key={i}
                              lang={s.language}
                              className="border-l-2 border-[#24131E]/40 pl-2 text-[#705664] italic"
                            >
                              “{q}”
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </article>
      )}

      {r.outcome === "evidence_only" && (
        <div className="rounded-2xl border border-[#F0DCE4] bg-white p-5">
          <Notice tone="info" title={t("ask.status.evidenceOnly")}>
            {t("ask.status.evidenceOnlyHelp")}
          </Notice>
          {r.risk !== "routine" && (
            <Notice tone="warning" className="mt-3">
              {t("ask.sensitiveNotice")}
            </Notice>
          )}
          <FoundSources r={r} t={t} selected={selected} />
        </div>
      )}

      {r.outcome === "abstained" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold">
                !
              </span>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-bold text-[#20101B]">
                  {r.abstainReason === "sensitive"
                    ? t("ask.sensitiveTitle")
                    : r.abstainReason === "out_of_scope"
                    ? t("ask.outOfScopeTitle")
                    : t("ask.insufficientTitle")}
                </h3>
                <p className="mt-1.5 text-support text-[#5A4450] leading-relaxed">
                  {r.abstainReason === "sensitive"
                    ? t("ask.sensitiveBody")
                    : r.abstainReason === "out_of_scope"
                    ? t("ask.outOfScopeBody")
                    : t("ask.insufficientBody")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {r.outcome === "failed" && (
        <Notice tone="error" role="alert" title={t("ask.failureTitle")}>
          <p>{t("ask.failureBody")}</p>
          <Button type="button" variant="secondary" className="mt-3" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        </Notice>
      )}

      {r.followUps.length > 0 && (
        <section className="mt-6">
          <h3 className="text-support font-semibold text-[#20101B] flex items-center gap-2">
            <span className="text-amber-800">✦</span>
            <span>{t("ask.followUps")}</span>
          </h3>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {r.followUps.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onAsk(q)}
                  className="rounded-full border border-[#F0DCE4] bg-[#FAF0F4] px-4 py-1.5 text-left text-support text-[#20101B] hover:bg-white hover:border-[#D9BDC9] transition-all shadow-2xs"
                >
                  {q} →
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 pt-4 border-t border-[#F0DCE4]">
        <Link
          href={`/report?type=answer&ref=${r.runId}`}
          className="inline-flex min-h-9 items-center gap-2 text-meta text-[#705664] hover:text-[#20101B] transition-colors"
        >
          <IconFlag width={15} height={15} /> {t("ask.reportAnswer")}
        </Link>
      </div>
    </div>
  );
}

function SourceLine({
  s,
  t,
  selected,
}: {
  s: AskResult["sources"][number] | AskResult["foundSources"][number];
  t: ClientT;
  selected: string;
}) {
  const internal = s.url?.startsWith("/");
  return (
    <div>
      <p className="font-semibold text-[#20101B]">
        {"n" in s ? <span className="mr-1 text-[#705664]">{s.n}.</span> : null}
        {s.title}
      </p>
      <p className="text-meta text-[#705664]">
        {[s.publisher, s.sourceType === "editorial" ? null : t(`source.type.${s.sourceType}`)].filter(Boolean).join(" · ")}
        {s.language !== selected ? ` · ${t("source.languageDiffers", { language: LANG_NAMES[s.language] ?? s.language })}` : ""}
      </p>
      {s.internal?.isFixture && (
        <span className="mt-1 block">
          <FixtureBadge label={t("common.devFixture")} />
        </span>
      )}
      {s.url ? (
        internal ? (
          <Link href={s.url} className="mt-1 inline-flex min-h-9 items-center text-meta font-semibold text-[#24131E] underline">
            {t("ask.internalSource")}
          </Link>
        ) : (
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex min-h-9 items-center gap-1 text-meta font-semibold text-[#24131E] underline"
          >
            {t("ask.sourceOpen")} <IconExternal width={14} height={14} />
          </a>
        )
      ) : (
        <p className="text-meta text-[#705664]">{t("source.noUrl")}</p>
      )}
    </div>
  );
}

function FoundSources({ r, t, selected }: { r: AskResult; t: ClientT; selected: string }) {
  return (
    <ul className="mt-3 space-y-3">
      {r.foundSources.map((s, i) => (
        <li key={i} className="rounded-xl border border-[#F0DCE4] bg-white p-3">
          <SourceLine s={s} t={t} selected={selected} />
          <p className="mt-2 text-meta font-semibold text-[#705664]">{t("ask.evidencePassage")}</p>
          <blockquote lang={s.language} className="border-l-2 border-[#24131E]/40 pl-2 text-support text-[#5A4450]">
            {s.excerpt}
          </blockquote>
        </li>
      ))}
    </ul>
  );
}
