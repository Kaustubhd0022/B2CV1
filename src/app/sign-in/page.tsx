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

  return (
    <main lang={hl} className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 sm:px-5">
      {/* Cinematic welcome panel (reference: "Explore Without Boundaries"). */}
      <header className="relative isolate -mx-4 mb-8 overflow-hidden sm:mx-0 sm:mt-6 sm:rounded-lg">
        <Image src="/images/dev/hampi.jpg" alt="" fill priority sizes="448px" className="-z-10 object-cover" />
        <div className="scrim absolute inset-0 -z-10" aria-hidden="true" />
        <div className="flex min-h-[340px] flex-col justify-end p-6">
          <p className="text-support font-semibold tracking-wide text-white/85">TattvaCo</p>
          <p className="mt-2 text-display leading-[1.08] text-white">
            <span className="font-light">{t("brand.tagline").split(" ").slice(0, 2).join(" ")} </span>
            <span className="font-semibold">{t("brand.tagline").split(" ").slice(2).join(" ")}</span>
          </p>
          <p className="mt-3 text-support text-white/80">{t("brand.promise")}</p>
          <p className="mt-3 text-[11px] text-white/50">Placeholder image — usage rights not verified</p>
        </div>
      </header>

      <h1 className="text-page font-semibold">{t("auth.title")}</h1>
      <p className="mt-1 text-support text-muted">{t("auth.subtitle")}</p>

      <div className="mt-5 space-y-3" aria-live="polite">
        {onScreenCodes && <Notice tone="warning">{t("auth.demoNotice")}</Notice>}
        {sp.reason === "expired" && <Notice tone="info">{t("auth.expired")}</Notice>}
        {error && (
          <Notice tone="error" role="alert">
            {t(error)}
          </Notice>
        )}
      </div>

      <div className="mt-6 grid gap-3">
        {google ? (
          <a href={`/auth/google${q}`} className="flex min-h-12 items-center justify-center rounded-full bg-forest px-4 font-semibold text-on-forest hover:bg-forest-hover">
            {t("auth.google")}
          </a>
        ) : (
          <ProviderUnavailable label={t("auth.google")} note={t("auth.providerUnavailable", { provider: "Google" })} />
        )}
        {apple ? (
          <a href={`/auth/apple${q}`} className="glass flex min-h-12 items-center justify-center rounded-full px-4 font-semibold text-charcoal hover:bg-surface-2">
            {t("auth.apple")}
          </a>
        ) : (
          <ProviderUnavailable label={t("auth.apple")} note={t("auth.providerUnavailable", { provider: "Apple" })} />
        )}
      </div>

      <div className="my-6 flex items-center gap-3 text-meta text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-border" /> {t("auth.or")} <span className="h-px flex-1 bg-border" />
      </div>

      <form action={startEmail} className="space-y-3" noValidate>
        <input type="hidden" name="next" value={next} />
        <label className="block text-support font-medium">
          {t("auth.email")}
          <input name="email" type="email" autoComplete="email" inputMode="email" required className={input} disabled={!email} />
        </label>
        <SubmitButton className="w-full" disabled={!email}>
          {t("auth.emailContinue")}
        </SubmitButton>
        {!email && <p className="text-meta text-muted">{t("auth.providerUnavailable", { provider: "Email" })}</p>}
      </form>

      <form action={startPhone} className="mt-6 space-y-3" noValidate>
        <input type="hidden" name="next" value={next} />
        <label className="block text-support font-medium">
          {t("auth.phone")}
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" required className={input} placeholder="+91" aria-describedby="phone-hint" disabled={!phone} />
        </label>
        <p id="phone-hint" className="text-meta text-muted">
          {t("auth.phoneHint")}
        </p>
        <SubmitButton variant="secondary" className="w-full" disabled={!phone}>
          {t("auth.phoneContinue")}
        </SubmitButton>
        {!phone && <p className="text-meta text-muted">{t("auth.providerUnavailable", { provider: "SMS" })}</p>}
      </form>

      <p className="mt-6 text-meta text-muted">{t("auth.recoveryNote")}</p>
      <p className="mt-2 text-meta text-muted">
        {t("auth.terms")}{" "}
        <Link href="/policies" className="text-forest underline">
          {t("settings.terms")}
        </Link>
      </p>
      {devOutbox && (
        <Notice tone="warning" className="mt-4">
          {t("auth.devOutbox")}
        </Notice>
      )}

      <nav aria-label={t("lang.change")} className="mt-8 flex flex-wrap gap-x-3 gap-y-1 text-meta">
        {LANGUAGES.map((l) => (
          <Link key={l.code} href={`/sign-in?hl=${l.code}&next=${encodeURIComponent(next)}`} lang={l.code} aria-current={l.code === hl ? "true" : undefined} className={l.code === hl ? "font-semibold text-charcoal underline" : "text-muted hover:text-charcoal"}>
            {l.native}
          </Link>
        ))}
      </nav>
    </main>
  );
}

function ProviderUnavailable({ label, note }: { label: string; note: string }) {
  return (
    <div>
      <button type="button" disabled aria-describedby={undefined} className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full border border-dashed border-border bg-surface px-4 font-semibold text-muted">
        {label}
      </button>
      <p className="mt-1 text-meta text-muted">{note}</p>
    </div>
  );
}
