"use client";

import { useState } from "react";
import Link from "next/link";
import { IconEye, IconEyeOff, IconGoogle } from "@/components/icons";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/languages";
import { startEmail, startPhone } from "./actions";

export interface AuthCardProps {
  next: string;
  error?: string;
  errorMessage?: string;
  googleConfigured: boolean;
  emailConfigured: boolean;
  smsConfigured: boolean;
  devOutbox: boolean;
  activeLanguage: string;
}

type AuthMode = "sign-in" | "create-account" | "forgot-password";
type Channel = "email" | "phone";

export function AuthCard({
  next,
  errorMessage,
  googleConfigured,
  emailConfigured,
  smsConfigured,
  devOutbox,
  activeLanguage,
}: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>("create-account");
  const [channel, setChannel] = useState<Channel>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authWithOtp, setAuthWithOtp] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    (activeLanguage as LanguageCode) || "en"
  );

  const inputCls =
    "mt-1.5 block w-full min-h-11 rounded-2xl border border-[#F0DCE4] bg-white px-4 py-2 text-sm text-[#20101B] placeholder:text-[#9A8492] transition-all focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 shadow-2xs";

  return (
    <div className="w-full max-w-[420px] rounded-[2rem] border border-[#F0DCE4] bg-white/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
      {/* Brand Header */}
      <div className="text-left">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-600/30 px-3 py-0.5 text-meta font-semibold text-amber-800">
            <span>✦</span>
            <span>Cultural Explorer Gateway</span>
          </span>
          <span className="text-[11px] font-medium text-[#7E6674]">Phase 1 Discovery</span>
        </div>

        <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-[#20101B]">
          {mode === "create-account"
            ? "Create Your Account"
            : mode === "sign-in"
            ? "Welcome Back"
            : "Reset Your Account"}
        </h2>
        <p className="mt-1 text-xs text-[#5A4550] leading-relaxed">
          {mode === "create-account"
            ? "Create your personal passport across 5,000 years of Indian living heritage."
            : mode === "sign-in"
            ? "Sign in to access your saved cultural stories, soundscapes, and map markers."
            : "Enter your registered email or phone to receive a secure recovery code."}
        </p>
      </div>

      {/* Mode Switcher Tabs (Sign In / Create Account) */}
      {mode !== "forgot-password" && (
        <div className="mt-4 flex rounded-2xl bg-[#FAF0F4] p-1 border border-[#F0DCE4]">
          <button
            type="button"
            onClick={() => setMode("create-account")}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              mode === "create-account"
                ? "bg-[#24131E] text-white shadow-xs"
                : "text-[#5A4550] hover:text-[#20101B]"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              mode === "sign-in"
                ? "bg-[#24131E] text-white shadow-xs"
                : "text-[#5A4550] hover:text-[#20101B]"
            }`}
          >
            Sign In
          </button>
        </div>
      )}

      {/* Error Notices */}
      {errorMessage && (
        <div className="mt-3" aria-live="polite">
          <Notice tone="error" role="alert" className="text-xs">
            {errorMessage}
          </Notice>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. CREATE ACCOUNT FORM (New User First Flow)
         ───────────────────────────────────────────────────────────── */}
      {mode === "create-account" && (
        <div className="mt-4 space-y-3.5">
          {/* Channel selector (Email vs Mobile) */}
          <div className="flex items-center justify-between text-xs font-medium text-[#5A4550]">
            <span>Sign up using:</span>
            <div className="flex items-center gap-1.5 rounded-full bg-[#FAF0F4] p-0.5 border border-[#F0DCE4]">
              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  channel === "email"
                    ? "bg-[#24131E] text-white shadow-2xs"
                    : "text-[#7E6674] hover:text-[#20101B]"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setChannel("phone")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  channel === "phone"
                    ? "bg-[#24131E] text-white shadow-2xs"
                    : "text-[#7E6674] hover:text-[#20101B]"
                }`}
              >
                Mobile (+91)
              </button>
            </div>
          </div>

          <form action={channel === "email" ? startEmail : startPhone} className="space-y-3" noValidate>
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="language" value={selectedLanguage} />

            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#20101B]">
                Full Name / Explorer Alias
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="e.g. Arya Sharma"
                  className={inputCls}
                />
              </label>
              <p className="mt-1 text-[10px] text-[#7E6674]">Used for your cultural passport & certificates.</p>
            </div>

            {/* 2. Contact input */}
            {channel === "email" ? (
              <div>
                <label className="block text-xs font-semibold text-[#20101B]">
                  Email Address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@example.org"
                    className={inputCls}
                    disabled={!emailConfigured}
                  />
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#20101B]">
                  Mobile Number (India)
                  <div className="relative mt-1.5">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-semibold text-[#5A4550]">
                      🇮🇳 +91
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="98765 43210"
                      className={`${inputCls} pl-16`}
                      disabled={!smsConfigured}
                    />
                  </div>
                </label>
                <p className="mt-1 text-[10px] text-[#7E6674]">We will send a 6-digit code via SMS.</p>
              </div>
            )}

            {/* 3. Primary Regional Language */}
            <div>
              <label className="block text-xs font-semibold text-[#20101B]">
                Preferred Regional Language
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                  className={`${inputCls} cursor-pointer`}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.english} ({l.native})
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-1 text-[10px] text-[#7E6674]">
                Sets native vernacular audio ragas, oral histories, and stories.
              </p>
            </div>

            {/* 4. Password */}
            <div>
              <label className="block text-xs font-semibold text-[#20101B]">
                Create Password
                <div className="relative mt-1.5">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#7E6674] hover:text-[#20101B] cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <IconEyeOff width={17} height={17} /> : <IconEye width={17} height={17} />}
                  </button>
                </div>
              </label>
            </div>

            {/* Submit */}
            <SubmitButton className="w-full !min-h-11 !rounded-2xl text-xs font-semibold mt-2">
              Create Cultural Passport →
            </SubmitButton>
          </form>

          {/* Social Alternative */}
          <div className="my-3 flex items-center gap-3 text-xs text-[#7E6674]" aria-hidden="true">
            <span className="h-px flex-1 bg-[#F0DCE4]" />
            <span className="text-[11px] font-medium">or register with</span>
            <span className="h-px flex-1 bg-[#F0DCE4]" />
          </div>

          {/* Google Sign-in Option */}
          {googleConfigured ? (
            <a
              href={`/auth/google?next=${encodeURIComponent(next)}`}
              className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#F0DCE4] bg-white px-4 text-xs font-semibold text-[#20101B] shadow-2xs hover:border-amber-600/40 hover:bg-[#FAF0F4] transition-all cursor-pointer"
            >
              <IconGoogle className="size-4 shrink-0" />
              <span>Continue with Google</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Google sign-in is not configured in this environment"
              className="flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-2xl border border-[#F0DCE4]/60 bg-[#FAF0F4]/60 px-4 text-xs font-semibold text-[#7E6674] opacity-75"
            >
              <IconGoogle className="size-4 shrink-0 grayscale opacity-60" />
              <span>Continue with Google (Offline)</span>
            </button>
          )}

          <div className="pt-1 text-center">
            <p className="text-xs text-[#5A4550]">
              Already an Explorer?{" "}
              <button
                type="button"
                onClick={() => setMode("sign-in")}
                className="font-semibold text-amber-800 hover:text-amber-900 underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SIGN IN FORM
         ───────────────────────────────────────────────────────────── */}
      {mode === "sign-in" && (
        <div className="mt-4 space-y-3.5">
          {/* Method selector: Email vs Phone */}
          <div className="flex items-center justify-between text-xs font-medium text-[#5A4550]">
            <span>Sign in method:</span>
            <div className="flex items-center gap-1.5 rounded-full bg-[#FAF0F4] p-0.5 border border-[#F0DCE4]">
              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  channel === "email"
                    ? "bg-[#24131E] text-white shadow-2xs"
                    : "text-[#7E6674] hover:text-[#20101B]"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setChannel("phone")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  channel === "phone"
                    ? "bg-[#24131E] text-white shadow-2xs"
                    : "text-[#7E6674] hover:text-[#20101B]"
                }`}
              >
                Mobile (+91)
              </button>
            </div>
          </div>

          <form action={channel === "email" ? startEmail : startPhone} className="space-y-3" noValidate>
            <input type="hidden" name="next" value={next} />

            {/* Email Channel */}
            {channel === "email" ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#20101B]">
                    Email Address
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="name@example.org"
                      className={inputCls}
                      disabled={!emailConfigured}
                    />
                  </label>
                </div>

                {!authWithOtp && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#20101B]">Password</label>
                      <button
                        type="button"
                        onClick={() => setMode("forgot-password")}
                        className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative mt-1">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className={`${inputCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#7E6674] hover:text-[#20101B] cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <IconEyeOff width={17} height={17} /> : <IconEye width={17} height={17} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthWithOtp(!authWithOtp)}
                    className="text-[11px] font-medium text-[#7E6674] hover:text-[#20101B] underline cursor-pointer"
                  >
                    {authWithOtp ? "← Use Password" : "Sign in with One-Time Code (OTP) instead"}
                  </button>
                </div>
              </>
            ) : (
              /* Phone Channel */
              <div>
                <label className="block text-xs font-semibold text-[#20101B]">
                  Mobile Number (India)
                  <div className="relative mt-1.5">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-semibold text-[#5A4550]">
                      🇮🇳 +91
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="98765 43210"
                      className={`${inputCls} pl-16`}
                      disabled={!smsConfigured}
                    />
                  </div>
                </label>
                <p className="mt-1 text-[10px] text-[#7E6674]">We will send a 6-digit code to this mobile.</p>
              </div>
            )}

            <SubmitButton className="w-full !min-h-11 !rounded-2xl text-xs font-semibold mt-2">
              {channel === "email" && !authWithOtp ? "Sign In →" : "Get Verification Code →"}
            </SubmitButton>
          </form>

          {/* Social Alternative */}
          <div className="my-3 flex items-center gap-3 text-xs text-[#7E6674]" aria-hidden="true">
            <span className="h-px flex-1 bg-[#F0DCE4]" />
            <span className="text-[11px] font-medium">or continue with</span>
            <span className="h-px flex-1 bg-[#F0DCE4]" />
          </div>

          {/* Google Sign-in Option */}
          {googleConfigured ? (
            <a
              href={`/auth/google?next=${encodeURIComponent(next)}`}
              className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#F0DCE4] bg-white px-4 text-xs font-semibold text-[#20101B] shadow-2xs hover:border-amber-600/40 hover:bg-[#FAF0F4] transition-all cursor-pointer"
            >
              <IconGoogle className="size-4 shrink-0" />
              <span>Continue with Google</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Google sign-in is not configured in this environment"
              className="flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-2xl border border-[#F0DCE4]/60 bg-[#FAF0F4]/60 px-4 text-xs font-semibold text-[#7E6674] opacity-75"
            >
              <IconGoogle className="size-4 shrink-0 grayscale opacity-60" />
              <span>Continue with Google (Offline)</span>
            </button>
          )}

          <div className="pt-1 text-center">
            <p className="text-xs text-[#5A4550]">
              New to TattvaCo?{" "}
              <button
                type="button"
                onClick={() => setMode("create-account")}
                className="font-semibold text-amber-800 hover:text-amber-900 underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. FORGOT PASSWORD / ACCOUNT RECOVERY FORM
         ───────────────────────────────────────────────────────────── */}
      {mode === "forgot-password" && (
        <div className="mt-4 space-y-3.5">
          <div className="rounded-2xl bg-[#FFF5F8] p-3 border border-[#F0DCE4] text-xs text-[#5A4550]">
            Enter your registered email address or phone number. We will send an encrypted one-time security code to recover your access.
          </div>

          <form action={channel === "email" ? startEmail : startPhone} className="space-y-3" noValidate>
            <input type="hidden" name="next" value={next} />

            {channel === "email" ? (
              <div>
                <label className="block text-xs font-semibold text-[#20101B]">
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
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#20101B]">
                  Your Registered Mobile Number
                  <div className="relative mt-1.5">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-semibold text-[#5A4550]">
                      🇮🇳 +91
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="98765 43210"
                      className={`${inputCls} pl-16`}
                    />
                  </div>
                </label>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-[#7E6674]">Recover using:</span>
              <button
                type="button"
                onClick={() => setChannel(channel === "email" ? "phone" : "email")}
                className="font-semibold text-amber-800 hover:underline cursor-pointer"
              >
                Switch to {channel === "email" ? "Mobile Number" : "Email"}
              </button>
            </div>

            <SubmitButton className="w-full !min-h-11 !rounded-2xl text-xs font-semibold mt-2">
              Send Recovery Code →
            </SubmitButton>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setMode("sign-in")}
              className="text-xs font-semibold text-[#24131E] hover:text-amber-800 underline cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* Legal & Terms Note */}
      <div className="mt-5 border-t border-[#F0DCE4] pt-3 text-center">
        <p className="text-[11px] text-[#7E6674]">
          By continuing, you agree to TattvaCo&apos;s{" "}
          <Link href="/policies" className="text-amber-800 underline font-medium hover:text-amber-900">
            Terms of Service & Cultural Privacy Charter
          </Link>
          .
        </p>
        {devOutbox && (
          <Notice tone="warning" className="mt-2.5 text-left text-xs">
            Development Mode: Verification codes are written to local outbox, not sent via SMS/Email.
          </Notice>
        )}
      </div>

      {/* Language Switcher Bar */}
      <div className="mt-3.5 border-t border-[#F0DCE4] pt-2.5">
        <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-[#9A8492]">
          Preview in Your Regional Language
        </p>
        <nav aria-label="Change preview language" className="mt-2 flex flex-wrap justify-center gap-x-2.5 gap-y-1 text-[11px]">
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
