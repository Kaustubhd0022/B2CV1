import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { maskTarget } from "@/lib/auth/normalize";
import { translator } from "@/lib/i18n/t";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { pendingVerification, resendCode, verifyCode } from "../actions";

export const metadata: Metadata = { title: "Verify" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const pending = await pendingVerification();
  if (!pending) redirect("/sign-in?error=expired_code");
  const t = translator("en");
  const channelLabel = pending.channel === "email" ? "email" : "phone";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-8 sm:px-5">
      <p className="mb-8 text-section font-semibold text-charcoal">TattvaCo</p>
      <h1 className="font-serif text-page font-semibold">{t("auth.verifyTitle", { channel: channelLabel })}</h1>
      {!pending.demoCode && (
        <p className="mt-2 text-support text-muted">
          {t("auth.verifySent", { target: maskTarget(pending.channel, pending.target), minutes: config().auth.otpMinutes })}
        </p>
      )}

      {pending.demoCode && (
        <div className="mt-5 rounded-md border-2 border-dashed border-warning bg-warning/5 p-4 text-center" role="status">
          <p className="text-support font-semibold text-warning">{t("auth.demoCode")}</p>
          <p className="mt-1 font-mono text-display font-semibold tracking-[0.3em] text-charcoal">{pending.demoCode}</p>
          <p className="mt-1 text-meta text-muted">{t("auth.demoCodeNote")}</p>
        </div>
      )}

      <div className="mt-5" aria-live="polite">
        {error === "invalid" && (
          <Notice tone="error" role="alert">
            {t("auth.codeInvalid")}
          </Notice>
        )}
        {error === "expired" && (
          <Notice tone="error" role="alert">
            {t("auth.codeExpired")}
          </Notice>
        )}
        {error === "locked" && (
          <Notice tone="error" role="alert">
            {t("auth.tooMany")}
          </Notice>
        )}
      </div>

      <form action={verifyCode} className="mt-6 space-y-3">
        <label className="block text-support font-medium">
          {t("auth.code")}
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            required
            autoFocus
            className="mt-1 block w-full min-h-12 rounded-full border border-border bg-surface px-5 py-2 text-center text-section tracking-[0.4em]"
          />
        </label>
        <SubmitButton className="w-full">{t("auth.verify")}</SubmitButton>
      </form>

      <form action={resendCode} className="mt-4">
        <SubmitButton variant="tertiary">{t("auth.resend")}</SubmitButton>
      </form>
      <Link href="/sign-in" className="mt-2 inline-flex min-h-11 items-center text-support text-forest underline-offset-4 hover:underline">
        {t("auth.useAnother")}
      </Link>
    </main>
  );
}
