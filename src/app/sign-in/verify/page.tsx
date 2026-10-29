import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { maskTarget } from "@/lib/auth/normalize";
import { translator } from "@/lib/i18n/t";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { pendingVerification, resendCode, verifyCode } from "../actions";

export const metadata: Metadata = { title: "Verify OTP — TattvaCo" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const pending = await pendingVerification();
  if (!pending) redirect("/sign-in?error=expired_code");
  const t = translator("en");
  const channelLabel = pending.channel === "email" ? "Email" : "Phone";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#FAF7F2] px-4 py-8 text-[#20101B]">
      <div className="w-full max-w-[360px] rounded-2xl border border-[#F0DCE4] bg-white/95 p-5 shadow-xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-600/30 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            <span>✦</span>
            <span>Cultural Explorer Passport</span>
          </span>
          <span className="text-[10px] font-medium text-[#7E6674]">One-Time Passcode</span>
        </div>

        <h1 className="mt-2.5 font-serif text-xl font-bold tracking-tight text-[#20101B]">
          Enter Verification Code
        </h1>
        <p className="mt-1 text-xs text-[#5A4550] leading-snug">
          We sent a 6-digit verification code to{" "}
          <strong className="font-semibold text-[#20101B]">
            {maskTarget(pending.channel, pending.target)}
          </strong>
          . New accounts are automatically registered!
        </p>

        {/* Demo/Screen Code Display */}
        {pending.demoCode && (
          <div className="mt-3.5 rounded-xl border border-amber-600/30 bg-amber-500/10 p-3 text-center" role="status">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">Your Verification Code</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-[0.25em] text-[#20101B]">{pending.demoCode}</p>
            <p className="mt-1 text-[10px] text-[#7E6674]">Valid for {config().auth.otpMinutes} minutes.</p>
          </div>
        )}

        {/* Error Notices */}
        <div className="mt-3" aria-live="polite">
          {error === "invalid" && (
            <Notice tone="error" role="alert" className="text-xs py-1.5 px-2.5">
              {t("auth.codeInvalid")}
            </Notice>
          )}
          {error === "expired" && (
            <Notice tone="error" role="alert" className="text-xs py-1.5 px-2.5">
              {t("auth.codeExpired")}
            </Notice>
          )}
          {error === "locked" && (
            <Notice tone="error" role="alert" className="text-xs py-1.5 px-2.5">
              {t("auth.tooMany")}
            </Notice>
          )}
        </div>

        <form action={verifyCode} className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#20101B]">
              6-Digit Code
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]{6,7}"
                maxLength={7}
                defaultValue={pending.demoCode ?? ""}
                required
                autoFocus
                className="mt-1 block w-full h-11 rounded-xl border border-[#E9D5DF] bg-white px-3 text-center font-mono text-xl font-bold tracking-[0.35em] text-[#20101B] focus:border-amber-600 focus:outline-none focus:ring-1.5 focus:ring-amber-500/20 shadow-2xs"
              />
            </label>
          </div>

          <SubmitButton className="w-full !min-h-10 !h-10 !py-2 !rounded-xl text-xs font-semibold">
            Verify & Continue →
          </SubmitButton>
        </form>

        <div className="mt-3 flex items-center justify-between border-t border-[#F0DCE4] pt-3 text-xs">
          <form action={resendCode}>
            <button
              type="submit"
              className="text-[11px] font-medium text-amber-800 hover:text-amber-900 hover:underline cursor-pointer"
            >
              Resend Code
            </button>
          </form>
          <Link
            href="/sign-in"
            className="text-[11px] font-medium text-[#7E6674] hover:text-[#20101B] hover:underline"
          >
            ← Use another email
          </Link>
        </div>
      </div>
    </main>
  );
}
