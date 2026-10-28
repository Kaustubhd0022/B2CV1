"use client";

import { useState } from "react";
import Link from "next/link";
import { IconEye, IconEyeOff, IconGoogle } from "@/components/icons";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/languages";
import { startEmail, startPhone } from "../sign-in/actions";

export interface SignUpCardProps {
  next: string;
  errorMessage?: string;
  googleConfigured: boolean;
  emailConfigured: boolean;
  smsConfigured: boolean;
  devOutbox: boolean;
  activeLanguage: string;
}

type Channel = "email" | "phone";

export function SignUpCard({
  next,
  errorMessage,
  googleConfigured,
  emailConfigured,
  smsConfigured,
  devOutbox,
  activeLanguage,
}: SignUpCardProps) {
  const [channel, setChannel] = useState<Channel>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    (activeLanguage as LanguageCode) || "en"
  );

  const inputCls =
    "mt-1 block w-full h-9 rounded-xl border border-[#E9D5DF] bg-white px-3 py-1.5 text-xs text-[#20101B] placeholder:text-[#9A8492] transition-all focus:border-amber-600 focus:outline-none focus:ring-1.5 focus:ring-amber-500/20 disabled:opacity-60 shadow-2xs";

  return (
    <div className="w-full max-w-[350px] rounded-2xl border border-[#F0DCE4] bg-white/95 p-4.5 sm:p-5 shadow-xl backdrop-blur-xl">
      {/* Brand Header */}
      <div className="text-left">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-600/30 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            <span>✦</span>
            <span>Cultural Explorer Passport</span>
          </span>
          <span className="text-[10px] font-medium text-[#7E6674]">Phase 1</span>
        </div>

        <h2 className="mt-2 font-serif text-xl font-bold tracking-tight text-[#20101B]">
          Create Your Account
        </h2>
        <p className="mt-0.5 text-[11px] text-[#5A4550] leading-snug">
          Create your cultural passport across 5,000 years of living heritage.
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

      {/* Form Content */}
      <div className="mt-3 space-y-2.5">
        {/* Channel selector pill */}
        <div className="flex items-center justify-between text-[11px] font-medium text-[#5A4550]">
          <span>Sign up using:</span>
          <div className="flex items-center gap-1 rounded-full bg-[#FAF0F4] p-0.5 border border-[#F0DCE4]">
            <button
              type="button"
              onClick={() => setChannel("email")}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
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
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
                channel === "phone"
                  ? "bg-[#24131E] text-white shadow-2xs"
                  : "text-[#7E6674] hover:text-[#20101B]"
              }`}
            >
              Mobile (+91)
            </button>
          </div>
        </div>

        <form action={channel === "email" ? startEmail : startPhone} className="space-y-2" noValidate>
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="language" value={selectedLanguage} />

          {/* 1. Full Name */}
          <div>
            <label className="block text-[11px] font-semibold text-[#20101B]">
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
          </div>

          {/* 2. Contact input */}
          {channel === "email" ? (
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
                  disabled={!emailConfigured}
                />
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-[#20101B]">
                Mobile Number (India)
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-[11px] font-semibold text-[#5A4550]">
                    🇮🇳 +91
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder="98765 43210"
                    className={`${inputCls} pl-14`}
                    disabled={!smsConfigured}
                  />
                </div>
              </label>
            </div>
          )}

          {/* 3. Regional Language */}
          <div>
            <label className="block text-[11px] font-semibold text-[#20101B]">
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
          </div>

          {/* 4. Password */}
          <div>
            <label className="block text-[11px] font-semibold text-[#20101B]">
              Create Password
              <div className="relative mt-1">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
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
            </label>
          </div>

          {/* Submit */}
          <SubmitButton className="w-full !min-h-9 !h-9 !py-1.5 !px-3 !rounded-xl text-xs font-semibold mt-1">
            Create Cultural Passport →
          </SubmitButton>
        </form>

        {/* Social Alternative */}
        <div className="my-2 flex items-center gap-2 text-xs text-[#7E6674]" aria-hidden="true">
          <span className="h-px flex-1 bg-[#E9D5DF]" />
          <span className="text-[10px] font-medium text-[#9A8492]">or register with</span>
          <span className="h-px flex-1 bg-[#E9D5DF]" />
        </div>

        {/* Google Sign-in Option */}
        {googleConfigured ? (
          <a
            href={`/auth/google?next=${encodeURIComponent(next)}`}
            className="flex min-h-9 h-9 w-full items-center justify-center gap-2 rounded-xl border border-[#E9D5DF] bg-white px-3 text-xs font-semibold text-[#20101B] shadow-2xs hover:border-amber-600/40 hover:bg-[#FAF0F4] transition-all cursor-pointer"
          >
            <IconGoogle className="size-3.5 shrink-0" />
            <span>Continue with Google</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Google sign-in is not configured in this environment"
            className="flex min-h-9 h-9 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#E9D5DF]/60 bg-[#FAF0F4]/60 px-3 text-xs font-semibold text-[#7E6674] opacity-75"
          >
            <IconGoogle className="size-3.5 shrink-0 grayscale opacity-60" />
            <span>Continue with Google (Offline)</span>
          </button>
        )}

        {/* Bottom Link: Redirect to Sign In Page */}
        <div className="pt-1 text-center">
          <p className="text-[11px] text-[#5A4550]">
            Already an Explorer?{" "}
            <Link
              href={`/sign-in?next=${encodeURIComponent(next)}`}
              className="font-semibold text-amber-800 hover:text-amber-900 underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Legal & Terms Note */}
      <div className="mt-3.5 border-t border-[#F0DCE4] pt-2 text-center">
        <p className="text-[10px] text-[#7E6674] leading-tight">
          By registering, you agree to TattvaCo&apos;s{" "}
          <Link href="/policies" className="text-amber-800 underline font-medium hover:text-amber-900">
            Terms & Privacy Charter
          </Link>
          .
        </p>
        {devOutbox && (
          <Notice tone="warning" className="mt-1.5 text-left text-[10px] py-1 px-2">
            Dev Mode: Codes written to local outbox.
          </Notice>
        )}
      </div>
    </div>
  );
}
