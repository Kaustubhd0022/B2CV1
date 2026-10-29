"use client";

import { useState } from "react";
import Link from "next/link";
import { IconEye, IconEyeOff, IconGoogle } from "@/components/icons";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { LANGUAGES } from "@/lib/i18n/languages";
import { signInAction, startEmail, signInWithGoogle } from "./actions";

export interface AuthCardProps {
  next: string;
  error?: string;
  errorMessage?: string;
  googleConfigured: boolean;
  emailConfigured: boolean;
  activeLanguage: string;
  onBeginTransition?: () => void;
}

type AuthMode = "sign-in" | "forgot-password";

export function AuthCard({
  next,
  errorMessage,
  googleConfigured,
  emailConfigured,
  activeLanguage,
  onBeginTransition,
}: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [showPassword, setShowPassword] = useState(false);
  const [authWithOtp, setAuthWithOtp] = useState(false);

  const inputCls =
    "mt-1 block w-full h-9 rounded-xl border border-[#E9D5DF] bg-white px-3 py-1.5 text-xs text-[#20101B] placeholder:text-[#9A8492] transition-all duration-200 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:shadow-[0_0_12px_rgba(198,125,40,0.18)] disabled:opacity-60 shadow-2xs";

  return (
    <div className="w-full max-w-[340px] rounded-2xl border border-[#F0DCE4] bg-white/95 p-4.5 sm:p-5 shadow-xl backdrop-blur-xl">
      {/* Brand Header */}
      <div className="text-left">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-600/30 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            <span>✦</span>
            <span>Cultural Explorer</span>
          </span>
          <span className="text-[10px] font-medium text-[#7E6674]">Passport Access</span>
        </div>

        <h2 className="mt-2 font-serif text-xl font-bold tracking-tight text-[#20101B]">
          {mode === "sign-in" ? "Welcome Explorer" : "Reset Password"}
        </h2>
        <p className="mt-0.5 text-[11px] text-[#5A4550] leading-snug">
          {mode === "sign-in"
            ? "Sign in or enter your email. New explorers are automatically registered!"
            : "Enter your registered email to receive a recovery code."}
        </p>
      </div>

      {/* Error Notices */}
      {errorMessage && (
        <div className="mt-2.5" aria-live="polite">
          <Notice tone="error" role="alert" className="text-[11px] py-1.5 px-2.5">
            {errorMessage}
          </Notice>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. SIGN IN VIEW (Real Email + Password + Google)
         ───────────────────────────────────────────────────────────── */}
      {mode === "sign-in" && (
        <div className="mt-3.5 space-y-2.5">
          <form
            action={signInAction}
            onSubmit={() => onBeginTransition?.()}
            className="space-y-2.5"
            noValidate
          >
            <input type="hidden" name="next" value={next} />
            {authWithOtp && <input type="hidden" name="auth_mode" value="otp" />}

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-semibold text-[#20101B]">
                Email Address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.org"
                  className={inputCls}
                />
              </label>
            </div>

            {/* Password */}
            {!authWithOtp && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#20101B]">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot-password")}
                    className="text-[10px] font-semibold text-amber-800 hover:text-amber-900 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    className={`${inputCls} pr-8`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#7E6674] hover:text-[#20101B] cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <IconEyeOff width={15} height={15} /> : <IconEye width={15} height={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP Alternative toggle */}
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => setAuthWithOtp(!authWithOtp)}
                className="text-[10.5px] font-medium text-[#7E6674] hover:text-[#20101B] underline cursor-pointer"
              >
                {authWithOtp ? "← Use Password" : "Sign in with Email OTP instead"}
              </button>
            </div>

            <SubmitButton className="group w-full !min-h-9 !h-9 !py-1.5 !px-3 !rounded-xl text-xs font-semibold mt-1 transition-all active:scale-[0.98]">
              <span className="inline-flex items-center justify-center gap-1.5">
                <span>{!authWithOtp ? "Sign In" : "Send Email Code"}</span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
            </SubmitButton>
          </form>

          {/* Social Alternative */}
          <div className="my-2 flex items-center gap-2 text-xs text-[#7E6674]" aria-hidden="true">
            <span className="h-px flex-1 bg-[#E9D5DF]" />
            <span className="text-[10px] font-medium text-[#9A8492]">or continue with</span>
            <span className="h-px flex-1 bg-[#E9D5DF]" />
          </div>

          {/* Google Sign-in Option (Supabase + Google OAuth) */}
          <form
            action={signInWithGoogle}
            onSubmit={() => onBeginTransition?.()}
            className="w-full"
          >
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="group flex min-h-9 h-9 w-full items-center justify-center gap-2 rounded-xl border border-[#E9D5DF] bg-white px-3 text-xs font-semibold text-[#20101B] shadow-2xs hover:border-amber-600/40 hover:bg-[#FAF0F4] transition-all cursor-pointer active:scale-[0.98]"
            >
              <IconGoogle className="size-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span>Continue with Google</span>
            </button>
          </form>

          {/* Bottom Redirect to Create Account Page */}
          <div className="pt-1 text-center">
            <p className="text-[11px] text-[#5A4550]">
              New to TattvaCo?{" "}
              <Link
                href={`/sign-up?next=${encodeURIComponent(next)}`}
                className="font-semibold text-amber-800 hover:text-amber-900 underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. FORGOT PASSWORD VIEW (Email-based)
         ───────────────────────────────────────────────────────────── */}
      {mode === "forgot-password" && (
        <div className="mt-3 space-y-2.5">
          <div className="rounded-xl bg-[#FFF5F8] p-2.5 border border-[#F0DCE4] text-[11px] text-[#5A4550] leading-snug">
            Enter your registered email address to receive a secure recovery code.
          </div>

          <form action={startEmail} className="space-y-2.5" noValidate>
            <input type="hidden" name="next" value={next} />

            <div>
              <label className="block text-[11px] font-semibold text-[#20101B]">
                Your Registered Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.org"
                  className={inputCls}
                />
              </label>
            </div>

            <SubmitButton className="w-full !min-h-9 !h-9 !py-1.5 !px-3 !rounded-xl text-xs font-semibold mt-1">
              Send Recovery Code →
            </SubmitButton>
          </form>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setMode("sign-in")}
              className="text-[11px] font-semibold text-[#24131E] hover:text-amber-800 underline cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* Legal & Terms Note */}
      <div className="mt-3.5 border-t border-[#F0DCE4] pt-2 text-center">
        <p className="text-[10px] text-[#7E6674] leading-tight">
          By signing in, you agree to TattvaCo&apos;s{" "}
          <Link href="/policies" className="text-amber-800 underline font-medium hover:text-amber-900">
            Terms & Privacy Charter
          </Link>
          .
        </p>
      </div>

      {/* Language Switcher Bar */}
      <div className="mt-2.5 border-t border-[#F0DCE4] pt-1.5">
        <p className="text-center text-[9px] font-semibold uppercase tracking-wider text-[#9A8492]">
          Preview Language
        </p>
        <nav aria-label="Change preview language" className="mt-1 flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[10px]">
          {LANGUAGES.map((l) => (
            <Link
              key={l.code}
              href={`/sign-in?hl=${l.code}&next=${encodeURIComponent(next)}`}
              lang={l.code}
              className={l.code === activeLanguage ? "font-bold text-amber-800 underline" : "text-[#7E6674] hover:text-[#20101B]"}
            >
              {l.native}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
