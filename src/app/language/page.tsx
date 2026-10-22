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

const ALL_LANGUAGES = [
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
    img: "/images/dev/varanasi-card.jpg",
    place: "Varanasi Ghats, Uttar Pradesh",
  },
  {
    code: "kn",
    native: "ಕನ್ನಡ",
    english: "Kannada",
    img: "/images/dev/hampi.jpg",
    place: "Vijaya Vittala Temple, Hampi, Karnataka",
  },
  {
    code: "ml",
    native: "മലയാളം",
    english: "Malayalam",
    img: "/images/dev/kochi.jpg",
    place: "Shore-Operated Fishing Nets, Kochi, Kerala",
  },
  {
    code: "bn",
    native: "বাংলা",
    english: "Bengali",
    img: "/images/dev/kolkata.jpg",
    place: "Hooghly Riverfront & Victoria Memorial, Kolkata",
  },
  {
    code: "ta",
    native: "தமிழ்",
    english: "Tamil",
    img: "/images/dev/madurai.jpg",
    place: "Meenakshi Amman Temple Gopuram, Madurai",
  },
  {
    code: "mr",
    native: "मराठी",
    english: "Marathi",
    img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80",
    place: "Gateway of India & Ajanta-Ellora, Maharashtra",
  },
  {
    code: "te",
    native: "తెలుగు",
    english: "Telugu",
    img: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80",
    place: "Charminar & Warangal, Telangana & Andhra Pradesh",
  },
  {
    code: "gu",
    native: "ગુજરાતી",
    english: "Gujarati",
    img: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80",
    place: "Somnath Temple & Rani ki Vav, Gujarat",
  },
  {
    code: "pa",
    native: "ਪੰਜਾਬੀ",
    english: "Punjabi",
    img: "https://images.unsplash.com/photo-1588096344356-9b5966d92efb?auto=format&fit=crop&w=600&q=80",
    place: "Harmandir Sahib Golden Temple, Amritsar, Punjab",
  },
  {
    code: "or",
    native: "ଓଡ଼ିଆ",
    english: "Odia",
    img: "https://images.unsplash.com/photo-1629813366051-b58137b2792c?auto=format&fit=crop&w=600&q=80",
    place: "Konark Sun Temple & Jagannath Puri, Odisha",
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

              {/* Dark green quote box matching reference */}
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

        {/* Right Column: Language Selection Flow matching reference */}
        <main className="flex-1 px-4 py-8 sm:px-8 md:px-12 lg:py-10">
          <div className="mx-auto max-w-xl">
            {/* Step header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Link href="/" className="font-serif text-card font-semibold text-gold lg:hidden">
                TattvaCo
              </Link>
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-gold" />
                <span className="text-meta font-semibold uppercase tracking-wider text-gold">
                  11 Planned Languages
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
                Explore places, people, traditions and ideas in your preferred native script or English.
              </p>
            </div>

            {sp.error && (
              <Notice tone="error" role="alert" className="mt-4">
                {t("common.error")}
              </Notice>
            )}

            {/* 11 Photographic Language Cards */}
            <form action="/language/select" method="post" className="mt-6">
              <input type="hidden" name="next" value={next} />
              <fieldset>
                <legend className="sr-only">Choose your language</legend>
                <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-4 max-h-[58vh] overflow-y-auto pr-1 no-scrollbar" staggerDelay={0.03}>
                  {ALL_LANGUAGES.map((l, index) => (
                    <StaggerItem key={l.code} className={index === ALL_LANGUAGES.length - 1 && ALL_LANGUAGES.length % 2 !== 0 ? "col-span-2 sm:col-span-1" : ""}>
                      <MotionCard hoverScale={1.025} hoverY={-2}>
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
                <SubmitButton className="w-full !min-h-12 !rounded-xl !bg-gold hover:!bg-gold-hover !text-on-gold font-semibold text-base shadow-md">
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
