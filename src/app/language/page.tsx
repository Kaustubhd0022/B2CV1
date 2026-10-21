import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { currentSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/normalize";
import { isLanguageCode } from "@/lib/i18n/languages";
import { translator } from "@/lib/i18n/t";
import { FadeIn, MotionCard, StaggerContainer, StaggerItem } from "@/components/motion";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Select Language" };

const FIVE_LANGUAGES = [
  {
    code: "en",
    native: "English",
    english: "English",
    img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80",
    place: "India Gate, New Delhi",
  },
  {
    code: "hi",
    native: "हिन्दी",
    english: "Hindi",
    img: "https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=600&q=80",
    place: "Varanasi Ghats, Uttar Pradesh",
  },
  {
    code: "mr",
    native: "मराठी",
    english: "Marathi",
    img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80",
    place: "Gateway of India, Maharashtra",
  },
  {
    code: "gu",
    native: "ગુજરાતી",
    english: "Gujarati",
    img: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80",
    place: "Somnath Temple, Gujarat",
  },
  {
    code: "bn",
    native: "বাংলা",
    english: "Bengali",
    img: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80",
    place: "Victoria Memorial, Kolkata",
  },
];

export default async function LanguagePage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const s = await currentSession();
  const jar = await cookies();
  const rawLang = s?.language ?? jar.get("tc-language")?.value ?? "en";
  const current = isLanguageCode(rawLang) ? rawLang : "en";
  const t = translator(current);
  const rawNext = safeNext(sp.next);
  const next = (!rawNext || rawNext === "/language" || rawNext.startsWith("/language?") || rawNext.startsWith("/language/")) ? "/" : rawNext;

  return (
    <div className="min-h-dvh bg-canvas text-charcoal">
      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col lg:flex-row">
        {/* Left Column: Temple arch photographic quote panel (Screen 2 Reference) */}
        <aside className="relative hidden w-full lg:flex lg:w-5/12 xl:w-5/12 flex-col justify-between overflow-hidden bg-[#141f1a] p-8 lg:p-10 text-white min-h-dvh">
          <Image
            src="/images/dev/hampi.jpg"
            alt="Ancient stone carved temple pavilion"
            fill
            priority
            sizes="50vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1612]/95 via-[#13221b]/70 to-[#192b23]/85" />

          <div className="relative z-10 flex flex-col justify-between h-full">
            {/* Brand header */}
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full border border-gold/40 bg-forest text-gold text-sm shadow-xs">
                ✦
              </span>
              <span className="font-serif text-card font-semibold tracking-wider text-white">TATTVACO</span>
            </div>

            {/* Cultural Quote - perfectly contrasted against dark scrim */}
            <div className="my-auto max-w-md py-8">
              <span className="text-meta font-semibold uppercase tracking-[0.18em] text-gold">
                ONE COUNTRY · MANY STORIES · YOUR LANGUAGE
              </span>
              <h2 className="mt-4 font-serif text-3xl xl:text-4xl font-semibold leading-tight text-white">
                Choose Your Language
              </h2>
              <p className="mt-4 text-sm text-white/85 leading-relaxed">
                Experience India&apos;s cultural stories in your language. You can always change this later.
              </p>

              {/* Dark green quote box matching page 10 reference */}
              <div className="mt-8 rounded-xl border border-white/10 bg-[#162920]/85 p-4 backdrop-blur-xs">
                <span className="font-serif text-2xl text-gold leading-none">“</span>
                <p className="mt-1 text-sm font-medium text-white italic leading-relaxed">
                  Different languages, one shared heritage.
                </p>
                <span className="mt-2 block text-xs text-white/60">— TattvaCo</span>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-xs text-white/50">
              Hampi, Karnataka · Vijayanagara Architecture
            </p>
          </div>
        </aside>

        {/* Right Column: Language Selection Flow matching page 10 reference */}
        <main className="flex-1 px-4 py-8 sm:px-8 md:px-12 lg:py-10">
          <div className="mx-auto max-w-xl">
            {/* Step header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Link href="/" className="font-serif text-card font-semibold text-forest lg:hidden">
                TattvaCo
              </Link>
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-gold" />
                <span className="text-meta font-semibold uppercase tracking-wider text-gold">
                  Step 1 of 3: Language
                </span>
              </div>
              <Link href="/sign-in" className="text-meta font-medium text-muted hover:text-charcoal flex items-center gap-1">
                Sign in <span>→</span>
              </Link>
            </div>

            <div className="mt-6">
              <h1 className="font-serif text-page font-semibold md:text-page-lg text-charcoal">
                Choose your language
              </h1>
              <p className="mt-1.5 text-support text-muted leading-relaxed">
                Explore places, people, traditions and ideas in your preferred language.
              </p>
            </div>

            {sp.error && (
              <Notice tone="error" role="alert" className="mt-4">
                {t("common.error")}
              </Notice>
            )}

            {/* 5 Photographic Language Cards matching page 10 reference */}
            <form action="/language/select" method="post" className="mt-6">
              <input type="hidden" name="next" value={next} />
              <fieldset>
                <legend className="sr-only">Choose your language</legend>
                <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-4" staggerDelay={0.06}>
                  {FIVE_LANGUAGES.map((l, index) => (
                    <StaggerItem key={l.code} className={index === 4 ? "col-span-2 sm:col-span-1" : ""}>
                      <MotionCard hoverScale={1.025} hoverY={-3}>
                        <label className="group relative flex aspect-[16/10] cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-surface-2 p-3.5 shadow-sm transition-all hover:shadow-lg has-[:checked]:border-gold has-[:checked]:ring-2 has-[:checked]:ring-gold">
                          {/* Cultural Landmark Background Image */}
                          <Image
                            src={l.img}
                            alt={l.place}
                            fill
                            sizes="(max-width: 640px) 50vw, 300px"
                            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Gradient scrim for readable text and checkmark */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

                          {/* Top bar with indicator badge */}
                          <div className="relative z-10 flex items-center justify-end">
                            <input
                              type="radio"
                              name="language"
                              value={l.code}
                              defaultChecked={l.code === current}
                              className="peer sr-only"
                              required
                            />
                            {/* Selected checkmark circle */}
                            <div className="hidden peer-checked:flex size-6 items-center justify-center rounded-full bg-gold text-[#111111] shadow-md font-bold">
                              <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            </div>
                            {/* Unselected empty circle */}
                            <div className="size-5 rounded-full border border-white/60 bg-black/25 peer-checked:hidden transition-opacity group-hover:border-white" />
                          </div>

                          {/* Bottom metadata */}
                          <div className="relative z-10 mt-auto">
                            <span lang={l.code} className="block font-serif text-lg sm:text-xl font-bold text-white drop-shadow-md">
                              {l.native}
                            </span>
                            <span className="block text-xs font-medium text-white/80">
                              {l.english}
                            </span>
                          </div>
                        </label>
                      </MotionCard>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </fieldset>

              <div className="mt-8 flex flex-col gap-3">
                <SubmitButton className="w-full !min-h-12 !rounded-xl !bg-forest hover:!bg-forest-hover !text-on-forest font-semibold text-base shadow-md">
                  Continue →
                </SubmitButton>
              </div>
            </form>

            <div className="mt-8 border-t border-border pt-4 text-center">
              <p className="text-xs text-muted">
                🌐 You can change your language anytime in Settings.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
