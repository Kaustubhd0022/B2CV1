import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/normalize";
import { languageReadiness } from "@/lib/i18n/readiness";
import { translator } from "@/lib/i18n/t";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Select Language" };

export default async function LanguagePage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const s = await requireUser();
  const current = s.language ?? "en";
  const t = translator(current);
  const langs = await languageReadiness();
  const next = safeNext(sp.next);

  return (
    <div className="min-h-dvh bg-canvas text-charcoal">
      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col lg:flex-row">
        {/* Left Column: Temple arch photographic quote panel (Desktop) */}
        <aside className="relative hidden w-full lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between overflow-hidden p-10 text-white">
          <Image
            src="/images/dev/hampi.jpg"
            alt="Stone carved temple pavilion at Hampi"
            fill
            priority
            sizes="50vw"
            className="-z-20 object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#141d18]/95 via-[#141d18]/60 to-[#141d18]/80" />

          {/* Brand header */}
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full border border-gold/40 bg-forest/80 text-gold text-sm shadow-xs">
              ✦
            </span>
            <span className="font-serif text-card font-semibold tracking-wider text-white">TATTVACO</span>
          </div>

          {/* Cultural Quote */}
          <div className="my-auto max-w-md py-12">
            <span className="text-meta font-semibold uppercase tracking-[0.16em] text-gold">
              Living Languages of India
            </span>
            <blockquote className="mt-4 font-serif text-display leading-tight text-white">
              “Culture speaks best in the mother tongue.”
            </blockquote>
            <p className="mt-4 text-body text-white/85 leading-relaxed">
              Explore interconnected stories, ancient sacred geographies, classical arts and living crafts in the language you think in.
            </p>
            <div className="mt-8 flex items-center gap-3 text-meta text-white/70">
              <span className="size-2 rounded-full bg-gold" />
              <span>11 Scheduled Launch Languages</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-white/50">
            Hampi, Karnataka · Vijayanagara Architecture
          </p>
        </aside>

        {/* Right Column: Language Selection Flow */}
        <main className="flex-1 px-4 py-8 sm:px-8 md:px-12 lg:py-12">
          <div className="mx-auto max-w-2xl">
            {/* Step header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Link href="/" className="font-serif text-card font-semibold text-forest lg:hidden">
                TattvaCo
              </Link>
              <span className="rounded-full bg-surface-2 px-3 py-1 text-meta font-semibold text-terracotta">
                Step 1 of 3: Language
              </span>
            </div>

            <div className="mt-6">
              <h1 className="font-serif text-page font-semibold md:text-page-lg text-charcoal">
                {t("lang.title")}
              </h1>
              <p className="mt-1.5 text-support text-muted leading-relaxed">
                {t("lang.subtitle")}
              </p>
            </div>

            {sp.error && (
              <Notice tone="error" role="alert" className="mt-4">
                {t("common.error")}
              </Notice>
            )}

            {/* Language card selection form */}
            <form action="/language/select" method="post" className="mt-6">
              <input type="hidden" name="next" value={next} />
              <fieldset>
                <legend className="sr-only">{t("lang.title")}</legend>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {langs.map((l) => (
                    <li key={l.code}>
                      <label className="group relative flex min-h-[82px] cursor-pointer items-start justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-forest hover:bg-surface-2 hover:shadow-xs has-[:checked]:border-forest has-[:checked]:bg-[#f4f7f4] has-[:checked]:ring-2 has-[:checked]:ring-forest/30">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span lang={l.code} className="font-serif text-card font-semibold text-charcoal">
                              {l.native}
                            </span>
                            <span className="text-meta text-muted font-medium">({l.english})</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                            <span
                              className={`inline-block rounded-xs px-1.5 py-0.5 font-medium ${
                                l.gatePassed ? "bg-forest/10 text-forest" : "bg-warning/10 text-warning"
                              }`}
                            >
                              {l.gatePassed ? t("lang.statusValidated") : t("lang.statusPreview")}
                            </span>
                            <span>·</span>
                            <span>{t("lang.uiCoverage", { percent: Math.round(l.uiCoverage * 100) })}</span>
                            <span>·</span>
                            <span>{t("lang.storiesAvailable", { count: l.publishedStories })}</span>
                          </div>
                        </div>

                        {/* Visible Radio indicator */}
                        <div className="ml-3 mt-1 shrink-0">
                          <input
                            type="radio"
                            name="language"
                            value={l.code}
                            defaultChecked={l.code === current}
                            className="size-4 accent-forest"
                            required
                          />
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SubmitButton className="w-full sm:w-auto px-8 min-h-12 shadow-xs">
                  {t("lang.continue")} →
                </SubmitButton>
                <Link
                  href={next || "/"}
                  className="text-center text-support font-medium text-muted hover:text-charcoal"
                >
                  Skip for now
                </Link>
              </div>
            </form>

            <div className="mt-8 border-t border-border pt-4">
              <p className="text-meta text-muted">{t("lang.note")}</p>
              <p className="mt-1 text-meta text-muted">{t("lang.sessionOnly")}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
