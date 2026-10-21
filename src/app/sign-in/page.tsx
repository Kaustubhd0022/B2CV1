import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { config } from "@/lib/config";
import { emailConfigured, smsConfigured } from "@/lib/auth/delivery";
import { oauthConfigured } from "@/lib/auth/oauth";
import { safeNext } from "@/lib/auth/normalize";
import { translator, type MessageKey } from "@/lib/i18n/t";
import { isLanguageCode, LANGUAGES } from "@/lib/i18n/languages";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { startEmail, startPhone } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, MessageKey> = {
  invalid_email: "auth.invalidEmail",
  invalid_phone: "auth.invalidPhone",
  too_many: "auth.tooMany",
  delivery: "auth.deliveryFailed",
  unavailable: "common.notConfigured",
  oauth_failed: "auth.failed",
  link_conflict: "auth.linkConflict",
  expired_code: "auth.codeExpired",
};

const input =
  "mt-1 block w-full min-h-12 rounded-full border border-border bg-surface px-5 py-2 text-body text-charcoal placeholder:text-muted/80 disabled:opacity-60";

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  // The interface language can be previewed before sign-in; nothing is stored.
  const hl = isLanguageCode(sp.hl) ? sp.hl : "en";
  const t = translator(hl);
  const next = safeNext(sp.next);
  const error = sp.error ? ERRORS[sp.error] : undefined;
  const google = oauthConfigured("google");
  const apple = oauthConfigured("apple");
  const email = emailConfigured();
  const phone = smsConfigured();
  const devOutbox = !config().isProd && (config().auth.email.provider === "dev-outbox" || config().auth.sms.provider === "dev-outbox");
  const onScreenCodes = config().auth.email.provider === "screen" || config().auth.sms.provider === "screen";
  const q = `?next=${encodeURIComponent(next)}`;

  const pilotCities = [
    { slug: "varanasi", name: "Varanasi", state: "Uttar Pradesh", img: "/images/dev/varanasi-card.jpg" },
    { slug: "jaipur", name: "Jaipur", state: "Rajasthan", img: "/images/dev/jaipur.jpg" },
    { slug: "hampi", name: "Hampi", state: "Karnataka", img: "/images/dev/hampi.jpg" },
    { slug: "kochi", name: "Kochi", state: "Kerala", img: "/images/dev/kochi.jpg" },
    { slug: "kolkata", name: "Kolkata", state: "West Bengal", img: "/images/dev/varanasi-hero.jpg" },
    { slug: "madurai", name: "Madurai", state: "Tamil Nadu", img: "/images/dev/hampi.jpg" },
  ];

  const categories = [
    { label: "Places", icon: "🏛️" },
    { label: "People", icon: "👤" },
    { label: "Festivals", icon: "🪔" },
    { label: "Food", icon: "🍲" },
    { label: "Crafts", icon: "🧵" },
    { label: "History", icon: "📜" },
    { label: "Traditions", icon: "🕉️" },
  ];

  return (
    <div lang={hl} className="min-h-dvh bg-canvas text-charcoal">
      {/* Background full-bleed photography container */}
      <div className="relative isolate min-h-dvh overflow-hidden">
        <Image
          src="/images/dev/varanasi-hero.jpg"
          alt="Ghats of Varanasi along the sacred Ganga"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        {/* Soft parchment overlay for cultural editorial contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#141d18]/90 via-[#1b2620]/80 to-[#141d18]/85 md:from-[#141d18]/92 md:via-[#18231e]/75 md:to-transparent"
        />

        <div className="mx-auto flex min-h-dvh max-w-7xl flex-col justify-between px-4 py-6 sm:px-6 md:px-10 lg:flex-row lg:items-center lg:gap-12 lg:py-10">
          {/* Left Column: Cultural editorial headline, categories & pilot cities */}
          <div className="flex max-w-2xl flex-col justify-center py-6 text-white lg:py-0">
            {/* Brand Logo & Emblem */}
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full border border-gold/40 bg-forest/80 text-gold shadow-xs">
                ✦
              </span>
              <span className="font-serif text-section font-semibold tracking-wider text-white">TATTVACO</span>
            </div>

            <p className="mt-6 text-meta font-semibold uppercase tracking-[0.16em] text-gold">
              Culture Lives in Connections
            </p>
            <h1 className="mt-3 font-serif text-display leading-tight text-white md:text-display-lg">
              Discover India Differently
            </h1>
            <p className="mt-4 max-w-xl text-body text-white/85 leading-relaxed">
              Connect stories, living traditions, sacred places and philosophical ideas across 5,000 years of living culture.
            </p>

            {/* Cultural Categories Strip */}
            <div className="mt-8">
              <p className="text-meta font-medium uppercase tracking-wider text-white/70">Explore 7 Dimensions</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <li
                    key={cat.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-support text-white/90 backdrop-blur-xs"
                  >
                    <span aria-hidden="true">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pilot Cities Showcase */}
            <div className="mt-10 hidden sm:block">
              <div className="flex items-center justify-between">
                <p className="text-meta font-medium uppercase tracking-wider text-white/70">6 Pilot Cities</p>
                <span className="text-meta text-gold">Phase 1 Discovery</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2.5 md:grid-cols-6">
                {pilotCities.map((city) => (
                  <div
                    key={city.slug}
                    className="group relative aspect-[3/4] overflow-hidden rounded-md border border-white/15 bg-surface-2 transition-all hover:border-gold/60"
                  >
                    <Image
                      src={city.img}
                      alt={city.name}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="scrim-bottom absolute inset-0" />
                    <div className="absolute inset-x-0 bottom-0 p-2">
                      <p className="text-meta font-semibold leading-tight text-white">{city.name}</p>
                      <p className="text-[10px] text-white/75">{city.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Floating Ivory Authentication Card (Screen 1 Master Spec) */}
          <div className="w-full max-w-md lg:shrink-0">
            <div className="rounded-2xl border border-border bg-[#FAF9F5] p-6 shadow-2xl backdrop-blur-md sm:p-8">
              <div className="text-left">
                <span className="inline-block rounded-full bg-forest/10 px-3 py-1 text-meta font-semibold text-forest">
                  Welcome to TattvaCo
                </span>
                <h2 className="mt-2 font-serif text-page font-semibold text-charcoal">{t("auth.title")}</h2>
                <p className="mt-1 text-support text-muted leading-snug">{t("auth.subtitle")}</p>
              </div>

              {/* Status and Error Notices */}
              <div className="mt-5 space-y-2.5" aria-live="polite">
                {onScreenCodes && <Notice tone="warning">{t("auth.demoNotice")}</Notice>}
                {sp.reason === "expired" && <Notice tone="info">{t("auth.expired")}</Notice>}
                {error && (
                  <Notice tone="error" role="alert">
                    {t(error)}
                  </Notice>
                )}
              </div>

              {/* OAuth Providers */}
              <div className="mt-6 grid gap-2.5">
                {google ? (
                  <a
                    href={`/auth/google${q}`}
                    className="flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-forest px-4 font-semibold text-on-forest shadow-xs transition-colors hover:bg-forest-hover"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>{t("auth.google")}</span>
                  </a>
                ) : (
                  <ProviderUnavailable label={t("auth.google")} note={t("auth.providerUnavailable", { provider: "Google" })} />
                )}
                {apple ? (
                  <a
                    href={`/auth/apple${q}`}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 font-semibold text-charcoal shadow-xs transition-colors hover:bg-surface-2"
                  >
                    <span></span>
                    <span>{t("auth.apple")}</span>
                  </a>
                ) : (
                  <ProviderUnavailable label={t("auth.apple")} note={t("auth.providerUnavailable", { provider: "Apple" })} />
                )}
              </div>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3 text-meta text-muted" aria-hidden="true">
                <span className="h-px flex-1 bg-border" />
                <span>{t("auth.or")}</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {/* Email Login Form */}
              <form action={startEmail} className="space-y-3" noValidate>
                <input type="hidden" name="next" value={next} />
                <label className="block text-support font-medium text-charcoal">
                  {t("auth.email")}
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    placeholder="name@example.org"
                    className={input}
                    disabled={!email}
                  />
                </label>
                <SubmitButton className="w-full" disabled={!email}>
                  {t("auth.emailContinue")}
                </SubmitButton>
                {!email && <p className="text-meta text-muted">{t("auth.providerUnavailable", { provider: "Email" })}</p>}
              </form>

              {/* Phone Login Form */}
              <form action={startPhone} className="mt-5 space-y-3" noValidate>
                <input type="hidden" name="next" value={next} />
                <label className="block text-support font-medium text-charcoal">
                  {t("auth.phone")}
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    className={input}
                    placeholder="+91"
                    aria-describedby="phone-hint"
                    disabled={!phone}
                  />
                </label>
                <p id="phone-hint" className="text-meta text-muted">
                  {t("auth.phoneHint")}
                </p>
                <SubmitButton variant="secondary" className="w-full" disabled={!phone}>
                  {t("auth.phoneContinue")}
                </SubmitButton>
                {!phone && <p className="text-meta text-muted">{t("auth.providerUnavailable", { provider: "SMS" })}</p>}
              </form>

              {/* Recovery & Legal Note */}
              <div className="mt-6 border-t border-border pt-4 text-center">
                <p className="text-meta text-muted">{t("auth.recoveryNote")}</p>
                <p className="mt-1 text-meta text-muted">
                  {t("auth.terms")}{" "}
                  <Link href="/policies" className="text-forest underline font-medium">
                    {t("settings.terms")}
                  </Link>
                </p>
                {devOutbox && (
                  <Notice tone="warning" className="mt-3 text-left">
                    {t("auth.devOutbox")}
                  </Notice>
                )}
              </div>

              {/* Language Switcher Bar */}
              <div className="mt-5 border-t border-border pt-3">
                <p className="text-center text-[11px] font-medium uppercase tracking-wider text-muted">
                  Preview in Your Language
                </p>
                <nav aria-label={t("lang.change")} className="mt-2 flex flex-wrap justify-center gap-x-2.5 gap-y-1 text-meta">
                  {LANGUAGES.map((l) => (
                    <Link
                      key={l.code}
                      href={`/sign-in?hl=${l.code}&next=${encodeURIComponent(next)}`}
                      lang={l.code}
                      aria-current={l.code === hl ? "true" : undefined}
                      className={l.code === hl ? "font-semibold text-forest underline" : "text-muted hover:text-charcoal"}
                    >
                      {l.native}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderUnavailable({ label, note }: { label: string; note: string }) {
  return (
    <div>
      <button
        type="button"
        disabled
        aria-describedby={undefined}
        className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full border border-dashed border-border bg-surface px-4 font-semibold text-muted"
      >
        {label}
      </button>
      <p className="mt-1 text-meta text-muted">{note}</p>
    </div>
  );
}
