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
import {
  IconApple,
  IconGoogle,
  IconPlaces,
  IconPeople,
  IconFestivals,
  IconFood,
  IconCrafts,
  IconHistory,
  IconBeliefs,
} from "@/components/icons";
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
  "mt-1 block w-full min-h-10 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-charcoal placeholder:text-muted/70 disabled:opacity-60";

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
  const q = `?next=${encodeURIComponent(next)}`;

  const pilotCities = [
    { slug: "varanasi", name: "Varanasi", state: "Uttar Pradesh", img: "/images/dev/varanasi-card.jpg" },
    { slug: "jaipur", name: "Jaipur", state: "Rajasthan", img: "/images/dev/jaipur.jpg" },
    { slug: "hampi", name: "Hampi", state: "Karnataka", img: "/images/dev/hampi.jpg" },
    { slug: "kochi", name: "Kochi", state: "Kerala", img: "/images/dev/kochi.jpg" },
    { slug: "kolkata", name: "Kolkata", state: "West Bengal", img: "/images/dev/kolkata.jpg" },
    { slug: "madurai", name: "Madurai", state: "Tamil Nadu", img: "/images/dev/madurai.jpg" },
  ];

  const categories = [
    { label: "Places", icon: IconPlaces },
    { label: "People", icon: IconPeople },
    { label: "Festivals", icon: IconFestivals },
    { label: "Food", icon: IconFood },
    { label: "Crafts", icon: IconCrafts },
    { label: "History", icon: IconHistory },
    { label: "Traditions", icon: IconBeliefs },
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

        <div className="mx-auto flex min-h-dvh max-w-7xl flex-col justify-between px-4 py-6 sm:px-6 md:px-10 lg:flex-row lg:items-center lg:gap-10 lg:py-8">
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
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <li
                      key={cat.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-support text-white/90 backdrop-blur-xs"
                    >
                      <Icon className="size-3.5 text-gold shrink-0" />
                      <span>{cat.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Pilot Cities Showcase */}
            <div className="mt-8 hidden sm:block">
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

          {/* Right Column: Floating Dark Authentication Card (Compact Desktop Size) */}
          <div className="w-full max-w-[370px] lg:shrink-0">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-xl">
              <div className="text-left">
                <span className="inline-block rounded-full bg-forest/10 border border-forest/20 px-2.5 py-0.5 text-xs font-semibold text-forest">
                  Welcome to TattvaCo
                </span>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-charcoal">{t("auth.title")}</h2>
                <p className="mt-1 text-xs text-muted leading-snug">{t("auth.subtitle")}</p>
              </div>

              {/* Status and Error Notices (removed demo and expired notices as requested) */}
              {error && (
                <div className="mt-3" aria-live="polite">
                  <Notice tone="error" role="alert">
                    {t(error)}
                  </Notice>
                </div>
              )}

              {/* OAuth Providers */}
              <div className="mt-4 grid gap-2">
                {google ? (
                  <a
                    href={`/auth/google${q}`}
                    className="flex min-h-11 items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-charcoal shadow-xs transition-all hover:bg-surface-2 hover:border-charcoal/30"
                  >
                    <IconGoogle className="size-5 shrink-0" />
                    <span>{t("auth.google")}</span>
                  </a>
                ) : (
                  <ProviderUnavailable
                    provider="google"
                    label={t("auth.google")}
                    note={t("auth.providerUnavailable", { provider: "Google" })}
                  />
                )}
                {apple ? (
                  <a
                    href={`/auth/apple${q}`}
                    className="flex min-h-11 items-center justify-center gap-3 rounded-xl bg-black px-4 text-sm font-semibold text-white shadow-xs transition-all hover:bg-neutral-900"
                  >
                    <IconApple className="size-5 shrink-0" />
                    <span>{t("auth.apple")}</span>
                  </a>
                ) : (
                  <ProviderUnavailable
                    provider="apple"
                    label={t("auth.apple")}
                    note={t("auth.providerUnavailable", { provider: "Apple" })}
                  />
                )}
              </div>

              {/* Divider */}
              <div className="my-3 flex items-center gap-3 text-xs text-muted" aria-hidden="true">
                <span className="h-px flex-1 bg-border" />
                <span>{t("auth.or")}</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {/* Email Login Form */}
              <form action={startEmail} className="space-y-2.5" noValidate>
                <input type="hidden" name="next" value={next} />
                <label className="block text-xs font-medium text-charcoal">
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
                <SubmitButton className="w-full !min-h-10 !py-2 text-sm" disabled={!email}>
                  {t("auth.emailContinue")}
                </SubmitButton>
                {!email && <p className="text-xs text-muted">{t("auth.providerUnavailable", { provider: "Email" })}</p>}
              </form>

              {/* Phone Login Form */}
              <form action={startPhone} className="mt-3.5 space-y-2.5" noValidate>
                <input type="hidden" name="next" value={next} />
                <label className="block text-xs font-medium text-charcoal">
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
                <p id="phone-hint" className="text-[11px] text-muted">
                  {t("auth.phoneHint")}
                </p>
                <SubmitButton variant="secondary" className="w-full !min-h-10 !py-2 text-sm" disabled={!phone}>
                  {t("auth.phoneContinue")}
                </SubmitButton>
                {!phone && <p className="text-xs text-muted">{t("auth.providerUnavailable", { provider: "SMS" })}</p>}
              </form>

              {/* Recovery & Legal Note */}
              <div className="mt-3.5 border-t border-border pt-2.5 text-center">
                <p className="text-[11px] text-muted">
                  {t("auth.terms")}{" "}
                  <Link href="/policies" className="text-gold underline font-medium hover:text-gold-hover">
                    {t("settings.terms")}
                  </Link>
                </p>
                {devOutbox && (
                  <Notice tone="warning" className="mt-2 text-left text-xs">
                    {t("auth.devOutbox")}
                  </Notice>
                )}
              </div>

              {/* Language Switcher Bar */}
              <div className="mt-3 border-t border-border pt-2">
                <p className="text-center text-[10px] font-medium uppercase tracking-wider text-muted">
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

function ProviderUnavailable({
  provider,
  label,
  note,
}: {
  provider: "google" | "apple";
  label: string;
  note: string;
}) {
  return (
    <div>
      <button
        type="button"
        disabled
        title={note}
        className={`flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border px-4 text-sm font-semibold shadow-xs transition-all ${
          provider === "apple"
            ? "border-transparent bg-black text-white hover:bg-black"
            : "border-border bg-surface text-charcoal hover:bg-surface"
        }`}
      >
        {provider === "google" ? (
          <IconGoogle className="size-5 shrink-0" />
        ) : (
          <IconApple className="size-5 shrink-0" />
        )}
        <span>{label}</span>
      </button>
      <p className="mt-1 text-[11px] text-muted">{note}</p>
    </div>
  );
}
