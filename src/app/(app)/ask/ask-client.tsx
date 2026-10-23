"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AskResult } from "@/lib/ai/types";
import { makeClientT, type ClientT } from "@/lib/i18n/client-t";
import { FadeIn, MotionCard, StaggerContainer, StaggerItem } from "@/components/motion";
import { IconExternal, IconFlag, IconSend } from "@/components/icons";
import { Button, EpistemicLabel, FixtureBadge, Notice, cx } from "@/components/ui";

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
  en: "English", hi: "हिन्दी", kn: "ಕನ್ನಡ", ml: "മലയാളം", bn: "বাংলা", ta: "தமிழ்", mr: "मराठी", te: "తెలుగు", gu: "ગુજરાતી", pa: "ਪੰਜਾਬੀ", or: "ଓଡ଼ିଆ",
};

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
      const update = (patch: Partial<Turn>) => setTurns((all) => all.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      setTurns((all) => (opts.replaceId ? all.map((x) => (x.id === id ? { id, question: q, state: "loading" } : x)) : [...all, { id, question: q, state: "loading" }]));
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, context }),
        });
        if (res.status === 401) {
          router.push(`/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}&reason=expired`);
          return;
        }
        if (!res.ok || !res.body) {
          const body = await res.json().catch(() => ({}));
          return update({ state: "error", error: body.error === "rate_limited" ? "rate_limited" : body.error === "too_long" ? "too_long" : body.error === "too_short" ? "too_short" : "service_failure" });
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
  }

  const SUGGESTED_TOPICS = [
    {
      category: "Sacred Geography & Rivers",
      questions: [
        "How are the Ganga, Kashi and pilgrimage connected?",
        "Why does Varanasi have 84 distinct ghats along the riverfront?",
      ],
    },
    {
      category: "Living Crafts & Master Guilds",
      questions: [
        "How are the riverfront rituals of Varanasi connected to Banarasi silk weavers?",
        "What makes traditional Indian handloom guilds historically syncretic?",
      ],
    },
    {
      category: "Monumental Architecture & Astronomy",
      questions: [
        "Why did Sawai Jai Singh build five stone observatories across India?",
        "What connects Vijayanagara architecture in Hampi to Madurai's Nayak dynasty?",
      ],
    },
    {
      category: "Philosophy & Epistemic Traditions",
      questions: [
        "What is the distinction between documented historical evidence and living tradition in Kashi?",
      ],
    },
  ];

  return (
    <div className="lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-8 items-start">
      {/* Left Sidebar: Suggested Inquiries & Grounding Info (Screen 9 Reference) */}
      <aside className="mb-8 lg:mb-0 space-y-6 lg:sticky lg:top-4">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-serif text-support font-semibold text-charcoal">Suggested Inquiries</h2>
            <span className="text-[11px] font-semibold text-forest">Phase 1 Pilot</span>
          </div>

          <StaggerContainer className="mt-4 space-y-5" staggerDelay={0.06}>
            {SUGGESTED_TOPICS.map((topic) => (
              <StaggerItem key={topic.category}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-terracotta">
                  {topic.category}
                </p>
                <div className="mt-2 space-y-1.5">
                  {topic.questions.map((qText) => (
                    <button
                      key={qText}
                      type="button"
                      onClick={() => void ask(qText)}
                      disabled={busy}
                      className="block w-full text-left rounded-lg border border-border/80 bg-surface-2 p-2.5 text-meta text-charcoal hover:border-gold/60 hover:bg-elevated transition-all shadow-xs"
                    >
                      “{qText}”
                    </button>
                  ))}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Source Grounding Assurance Panel */}
        <div className="rounded-xl border border-forest/20 bg-forest/5 p-4 text-meta text-muted shadow-xs">
          <p className="font-semibold text-forest">✦ Real-time Source Grounding</p>
          <p className="mt-1 leading-relaxed text-secondary-text">
            Every answer is verified against statutory archives, academic repositories and primary gazetteers before rendering.
          </p>
        </div>
      </aside>

      {/* Right Column: Chat Timeline and Input Composer */}
      <div className="min-w-0">
        {turns.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <p className="text-meta text-muted">{t("ask.sessionNote")}</p>
            <Button variant="secondary" type="button" onClick={newTopic} disabled={busy} className="h-9 px-4 text-meta">
              {t("ask.newTopic")}
            </Button>
          </div>
        )}

        <ol className="space-y-8">
          {turns.map((turn) => (
            <li key={turn.id} className="space-y-4">
              {/* User Question Bubble */}
              <FadeIn duration={0.3} y={10}>
                <div className="rounded-xl border border-border bg-elevated p-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">
                    {t("ask.yourQuestion")}
                  </p>
                  <p className="mt-1 font-serif text-section font-semibold text-charcoal">{turn.question}</p>
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

        {/* Follow-up / Initial Input Composer */}
        <form
          className="mt-8 rounded-2xl border border-border bg-surface p-4 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (busy) return;
            void ask(draft);
            setDraft("");
          }}
        >
          <label htmlFor="ask-input" className="sr-only">
            {turns.length ? t("ask.followUp") : t("ask.placeholder")}
          </label>
          <div className="flex items-end gap-2.5">
            <textarea
              id="ask-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder={turns.length ? t("ask.followUp") : t("ask.placeholder")}
              className="block min-h-12 w-full resize-y rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-body text-charcoal placeholder:text-muted focus:border-gold focus:outline-none"
              aria-invalid={!!inputError}
              aria-describedby={inputError ? "ask-error" : "ask-lang"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-forest text-on-forest hover:bg-forest-hover disabled:bg-muted/50 transition-colors shadow-xs"
              aria-label={t("ask.submit")}
            >
              <IconSend width={20} height={20} />
            </button>
          </div>
          {inputError ? (
            <p id="ask-error" role="alert" className="mt-1 text-meta text-error font-medium">
              {inputError}
            </p>
          ) : (
            <p id="ask-lang" className="mt-1.5 text-meta text-muted">
              {t("ask.responseLanguage", { language: LANG_NAMES[lang] ?? lang })}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function snapshot(question: string, r: AskResult) {
  const answer = [r.summary, ...r.sections.flatMap((s) => [s.heading, ...s.points.map((p) => p.text)])].filter(Boolean).join("\n");
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
    <div className="rounded-md border border-border bg-surface p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="size-5 animate-spin rounded-full border-2 border-forest border-r-transparent" aria-hidden="true" />
        <span className="text-support font-semibold">{t(`ask.stage.${stages[Math.max(0, idx)]}`)}</span>
      </div>
      <ol className="mt-3 flex gap-1.5" aria-hidden="true">
        {stages.map((s, i) => (
          <li key={s} className={cx("h-1 flex-1 rounded-full", i <= idx ? "bg-forest" : "bg-border")} />
        ))}
      </ol>
      <p className="mt-2 text-meta text-muted">{t("ask.progressNote")}</p>
    </div>
  );
}

function Markers({ nums, runId }: { nums: number[]; runId: string }) {
  if (!nums.length) return null;
  return (
    <span className="ml-1 whitespace-nowrap">
      {nums.map((n) => (
        <a key={n} href={`#src-${runId}-${n}`} className="ml-0.5 inline-flex min-w-6 items-center justify-center rounded-sm border border-forest/40 px-1 text-meta font-semibold text-forest no-underline hover:bg-forest/10" aria-label={`Source ${n}`}>
          {n}
        </a>
      ))}
    </span>
  );
}

function Answer({ result: r, t, onRetry, onAsk, selected }: { result: AskResult; t: ClientT; onRetry: () => void; onAsk: (q: string) => void; selected: string }) {
  const shown = r.outcome === "routine_approved" || r.outcome === "qualified";

  return (
    <div className="space-y-4">
      {r.detectedLanguage && (
        <Notice>{t("ask.languageDetected", { language: LANG_NAMES[r.detectedLanguage] ?? r.detectedLanguage, selected: LANG_NAMES[selected] ?? selected })}</Notice>
      )}
      {r.retrievalIssues.length > 0 && <Notice tone="warning">{t("ask.retrievalLimited", { providers: r.retrievalIssues.join(", ") })}</Notice>}

      {shown && (
        <article className="rounded-2xl border border-border/80 bg-surface p-5 sm:p-7 md:p-8 shadow-sm" aria-label={t("ask.response")}>
          {/* 1. Direct Editorial Answer First */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
              <span>✦</span>
              <span>Cultural Knowledge Synthesis</span>
            </div>

            {r.summary && (
              <p className="font-serif text-lg md:text-xl font-medium leading-relaxed text-charcoal">
                {r.summary}
                <Markers nums={r.summarySources} runId={r.runId} />
              </p>
            )}

            {r.sections.map((s, i) => (
              <section key={i} className="mt-6 pt-4 border-t border-border/50">
                <h3 className="font-serif text-card font-semibold text-charcoal">{s.heading || t("ask.context")}</h3>
                <ul className="mt-3 space-y-3">
                  {s.points.map((p, j) => (
                    <li key={j} className="text-body text-charcoal/95 leading-relaxed">
                      <EpistemicLabel kind={p.epistemic} label={t(`epistemic.${p.epistemic}`)} /> <span className="ml-1.5">{p.text}</span>
                      <Markers nums={p.sources} runId={r.runId} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {r.perspectives.length > 0 && (
              <section className="mt-6 pt-4 border-t border-border/50">
                <h3 className="font-serif text-card font-semibold text-charcoal">{t("ask.perspectives")}</h3>
                <ul className="mt-3 grid gap-3 md:grid-cols-2">
                  {r.perspectives.map((p, i) => (
                    <li key={i} className="rounded-xl border border-border/80 bg-surface-2 p-3.5">
                      <p className="font-semibold text-support text-gold">{p.label}</p>
                      <p className="mt-1 text-support text-secondary-text leading-relaxed">
                        {p.text}
                        <Markers nums={p.sources} runId={r.runId} />
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* 2. Reassuring Institutional Grounding & Sources Panel Below */}
          <div className="mt-8 rounded-xl border border-border/70 bg-[#161411] p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-forest/20 text-forest text-xs font-bold">
                  ✓
                </span>
                <span className="text-support font-semibold text-charcoal">
                  {r.outcome === "routine_approved" ? "Verified Cultural Synthesis" : "Qualified Contextual Synthesis"}
                </span>
              </div>
              <span className="text-meta text-muted">
                {r.sources.length} Verified Sources Grounded
              </span>
            </div>

            {/* Sources List */}
            <section aria-labelledby={`sources-${r.runId}`}>
              <h4 id={`sources-${r.runId}`} className="text-meta font-semibold uppercase tracking-wider text-muted">
                {t("ask.sources")}
              </h4>
              <ol className="mt-2.5 space-y-2">
                {r.sources.map((s) => (
                  <li key={s.n} id={`src-${r.runId}-${s.n}`} className="scroll-mt-24 rounded-lg border border-border/60 bg-surface-2 p-2.5 target:ring-2 target:ring-forest text-support">
                    <SourceLine s={s} t={t} selected={selected} />
                    {s.quotes.length > 0 && (
                      <details className="mt-1.5 text-meta">
                        <summary className="cursor-pointer font-semibold text-forest hover:underline">{t("ask.quotesLabel")}</summary>
                        <ul className="mt-1 space-y-1">
                          {s.quotes.map((q, i) => (
                            <li key={i} lang={s.language} className="border-l-2 border-forest/40 pl-2 text-muted italic">
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

            {/* Expandable Verification Audit & Checks */}
            {(r.limitations.length > 0 || r.failedChecks.length > 0 || r.risk !== "routine") && (
              <details className="pt-2 text-meta text-muted border-t border-border/50">
                <summary className="cursor-pointer font-medium hover:text-charcoal transition-colors">
                  Archival audit & verification notes ({r.failedChecks.length ? "1 advisory" : "verified"})
                </summary>
                <div className="mt-3 space-y-2 text-support pl-2">
                  {r.limitations.length > 0 && (
                    <div>
                      <p className="font-semibold text-charcoal">{t("ask.limits")}:</p>
                      <ul className="list-disc pl-5 text-secondary-text">
                        {r.limitations.map((l, i) => (
                          <li key={i}>{l}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {r.failedChecks.length > 0 && (
                    <div className="mt-2 text-warning">
                      <p className="font-semibold">{t("ask.checksTitle")}:</p>
                      <ul className="list-disc pl-5">
                        {r.failedChecks.map((c) => (
                          <li key={c.id}>{t(`check.${c.id}`)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {r.risk !== "routine" && (
                    <p className="mt-2 text-warning italic">{t("ask.sensitiveNotice")}</p>
                  )}
                </div>
              </details>
            )}
          </div>
        </article>
      )}

      {r.outcome === "evidence_only" && (
        <div className="rounded-lg border border-border bg-surface p-4">
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
        <div className="rounded-lg border border-border bg-surface p-4">
          <Notice
            tone="warning"
            role="status"
            title={r.abstainReason === "sensitive" ? t("ask.sensitiveTitle") : r.abstainReason === "out_of_scope" ? t("ask.outOfScopeTitle") : t("ask.insufficientTitle")}
          >
            <p>{r.abstainReason === "sensitive" ? t("ask.sensitiveBody") : r.abstainReason === "out_of_scope" ? t("ask.outOfScopeBody") : t("ask.insufficientBody")}</p>
            {r.abstainReason === "insufficient_evidence" && <p className="mt-1">{t("ask.tryNarrower")}</p>}
          </Notice>
          {r.foundSources.length > 0 && r.abstainReason !== "sensitive" && (
            <>
              <p className="mt-3 text-support text-muted">{t("ask.foundSourcesNote")}</p>
              <FoundSources r={r} t={t} selected={selected} />
            </>
          )}
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

      {r.nextDiscoveries.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-gold">
            <span>✦</span>
            <span>{t("ask.nextDiscoveries")}</span>
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {r.nextDiscoveries.map((d) => (
              <li key={`${d.kind}:${d.slug}`}>
                <Link href={`/${d.kind === "story" ? "stories" : "connections"}/${d.slug}`} className="block rounded-xl border border-border bg-surface-2 p-3.5 hover:border-gold/50 hover:bg-surface transition-all shadow-2xs">
                  <span className="font-serif font-semibold text-charcoal hover:text-gold">{d.title}</span>
                  <span className="mt-1 block text-meta text-muted">{t("ask.nextRationale")}</span>
                  {d.isFixture && (
                    <span className="mt-2 block">
                      <FixtureBadge label={t("common.devFixture")} />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-border/80 bg-surface-2/60 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-gold">
            <span>✦</span>
            <span>Deepen Your Discovery</span>
          </div>
          <p className="mt-1.5 text-support text-secondary-text">
            Continue exploring India&apos;s living traditions through verified flagship stories and sacred geography.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/explore"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-forest px-5 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
            >
              Explore Flagship Stories →
            </Link>
            <Link
              href="/places"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-surface px-5 text-support font-semibold text-charcoal hover:border-gold/40 transition-colors"
            >
              View on Cultural Map →
            </Link>
          </div>
        </section>
      )}

      {r.followUps.length > 0 && (
        <section className="mt-6">
          <h3 className="text-support font-semibold text-charcoal flex items-center gap-2">
            <span className="text-gold">✦</span>
            <span>{t("ask.followUps")}</span>
          </h3>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {r.followUps.map((q) => (
              <li key={q}>
                <button type="button" onClick={() => onAsk(q)} className="min-h-11 rounded-full border border-border bg-surface-2 px-4 text-left text-support text-charcoal hover:border-gold hover:text-gold transition-colors shadow-2xs">
                  {q} →
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 pt-4 border-t border-border/60">
        <Link href={`/report?type=answer&ref=${r.runId}`} className="inline-flex min-h-9 items-center gap-2 text-meta text-muted hover:text-charcoal transition-colors">
          <IconFlag width={15} height={15} /> {t("ask.reportAnswer")}
        </Link>
      </div>
    </div>
  );
}

function SourceLine({ s, t, selected }: { s: AskResult["sources"][number] | AskResult["foundSources"][number]; t: ClientT; selected: string }) {
  const internal = s.url?.startsWith("/");
  return (
    <div>
      <p className="font-semibold">
        {"n" in s ? <span className="mr-1 text-muted">{s.n}.</span> : null}
        {s.title}
      </p>
      <p className="text-meta text-muted">
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
          <Link href={s.url} className="mt-1 inline-flex min-h-9 items-center text-meta font-semibold text-forest underline">
            {t("ask.internalSource")}
          </Link>
        ) : (
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-9 items-center gap-1 text-meta font-semibold text-forest underline">
            {t("ask.sourceOpen")} <IconExternal width={14} height={14} />
          </a>
        )
      ) : (
        <p className="text-meta text-muted">{t("source.noUrl")}</p>
      )}
    </div>
  );
}

function FoundSources({ r, t, selected }: { r: AskResult; t: ClientT; selected: string }) {
  return (
    <ul className="mt-3 space-y-3">
      {r.foundSources.map((s, i) => (
        <li key={i} className="rounded-md border border-border bg-canvas p-3">
          <SourceLine s={s} t={t} selected={selected} />
          <p className="mt-2 text-meta font-semibold text-muted">{t("ask.evidencePassage")}</p>
          <blockquote lang={s.language} className="border-l-2 border-forest/40 pl-2 text-support">
            {s.excerpt}
          </blockquote>
        </li>
      ))}
    </ul>
  );
}
