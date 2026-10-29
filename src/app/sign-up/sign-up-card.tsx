"use client";

import { useState } from "react";
import Link from "next/link";
import { IconEye, IconEyeOff, IconGoogle } from "@/components/icons";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/languages";
import { createAccount, signInWithGoogle } from "../sign-in/actions";

export interface SignUpCardProps {
  next: string;
  errorMessage?: string;
  googleConfigured: boolean;
  emailConfigured: boolean;
  activeLanguage: string;
  initialEmail?: string;
}

export function SignUpCard({
  next,
  errorMessage,
  googleConfigured,
  emailConfigured,
  activeLanguage,
  initialEmail = "",
}: SignUpCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    (activeLanguage as LanguageCode) || "en"
  );
  const [emailValue, setEmailValue] = useState(initialEmail);
  const [ndaAgreed, setNdaAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ndaError, setNdaError] = useState(false);

  const inputCls =
    "mt-1 block w-full h-9 rounded-xl border border-[#E9D5DF] bg-white px-3 py-1.5 text-xs text-[#20101B] placeholder:text-[#9A8492] transition-all focus:border-amber-600 focus:outline-none focus:ring-1.5 focus:ring-amber-500/20 disabled:opacity-60 shadow-2xs";

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!ndaAgreed) {
      e.preventDefault();
      setNdaError(true);
    }
  }

  function handleGoogleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!ndaAgreed) {
      e.preventDefault();
      setNdaError(true);
    }
  }

  return (
    <div className="w-full max-w-[360px] rounded-2xl border border-[#F0DCE4] bg-white/95 p-4.5 sm:p-5 shadow-xl backdrop-blur-xl">
      {/* Brand Header */}
      <div className="text-left">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-600/30 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            <span>✦</span>
            <span>Cultural Explorer Passport</span>
          </span>
          <span className="text-[10px] font-medium text-[#7E6674]">New Passport</span>
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
      <div className="mt-3.5 space-y-2.5">
        <form action={createAccount} onSubmit={handleFormSubmit} className="space-y-2.5" noValidate>
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="language" value={selectedLanguage} />
          <input type="hidden" name="nda_agreed" value={ndaAgreed ? "true" : "false"} />

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

          {/* 2. Email Address */}
          <div>
            <label className="block text-[11px] font-semibold text-[#20101B]">
              Email Address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="name@example.org"
                className={inputCls}
              />
            </label>
          </div>

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

          {/* ─────────────────────────────────────────────────────────────
              5. MANDATORY NON-DISCLOSURE AGREEMENT (NDA)
             ───────────────────────────────────────────────────────────── */}
          <div
            className={`mt-2 rounded-xl border p-2.5 transition-all ${
              ndaError
                ? "border-rose-400 bg-rose-50/50 ring-2 ring-rose-400/20"
                : ndaAgreed
                ? "border-amber-700/30 bg-amber-50/20"
                : "border-[#E9D5DF] bg-[#FAF5F8]/70"
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#20101B]">
                <span className="text-amber-800 text-xs">📜</span>
                <span>Confidentiality & NDA</span>
              </div>
              <span className="rounded-full bg-amber-700/10 border border-amber-800/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-900 uppercase tracking-wider">
                Must Agree
              </span>
            </div>

            {/* Scrollable preview of the agreement */}
            <div className="max-h-16 overflow-y-auto rounded-lg border border-[#E9D5DF]/90 bg-white p-2 text-[9.5px] text-[#5A4550] leading-relaxed shadow-2xs space-y-1">
              <p className="font-semibold text-[#20101B]">Notice · DV’S TattvaCo Originals LLP</p>
              <p>
                I acknowledge and agree that TattvaCo (the “Interface”) is a product currently under development, owned and operated by DV’S TattvaCo Originals LLP (the “Company”), and is therefore a confidential product of the Company...
              </p>
            </div>

            <div className="mt-1.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] font-semibold text-amber-800 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer"
              >
                <span>Read Full Agreement (4 clauses)</span>
                <span>↗</span>
              </button>
              <span className="text-[9px] text-[#7E6674]">Legally binding</span>
            </div>

            {/* Checkbox input */}
            <div className="mt-2 pt-2 border-t border-[#E9D5DF]/70">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="nda-checkbox"
                  checked={ndaAgreed}
                  onChange={(e) => {
                    setNdaAgreed(e.target.checked);
                    if (e.target.checked) setNdaError(false);
                  }}
                  className="mt-0.5 size-3.5 rounded border-[#C4B2BD] text-amber-800 focus:ring-amber-600/30 accent-amber-800 cursor-pointer"
                />
                <span className="text-[10px] text-[#20101B] font-medium leading-snug">
                  I have read, understood, and agree to the <strong>Confidentiality & Non-Disclosure Agreement</strong>.
                </span>
              </label>
            </div>

            {/* Validation Notice */}
            {ndaError && (
              <p className="mt-1.5 text-[10px] font-semibold text-rose-700 flex items-center gap-1" role="alert">
                <span>⚠️</span>
                <span>You must tick and agree to the NDA before creating an account.</span>
              </p>
            )}
          </div>

          {/* Submit */}
          <SubmitButton className="w-full !min-h-9 !h-9 !py-1.5 !px-3 !rounded-xl text-xs font-semibold mt-1">
            {ndaAgreed ? "I Agree & Create Passport →" : "Agree & Create Account →"}
          </SubmitButton>
        </form>

        {/* Social Alternative */}
        <div className="my-2 flex items-center gap-2 text-xs text-[#7E6674]" aria-hidden="true">
          <span className="h-px flex-1 bg-[#E9D5DF]" />
          <span className="text-[10px] font-medium text-[#9A8492]">or register with</span>
          <span className="h-px flex-1 bg-[#E9D5DF]" />
        </div>

        {/* Google Sign-in Option (Supabase + Google OAuth) */}
        <form action={signInWithGoogle} onSubmit={handleGoogleSubmit} className="w-full">
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="flex min-h-9 h-9 w-full items-center justify-center gap-2 rounded-xl border border-[#E9D5DF] bg-white px-3 text-xs font-semibold text-[#20101B] shadow-2xs hover:border-amber-600/40 hover:bg-[#FAF0F4] transition-all cursor-pointer"
          >
            <IconGoogle className="size-3.5 shrink-0" />
            <span>Continue with Google</span>
          </button>
        </form>

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
      <div className="mt-3 border-t border-[#F0DCE4] pt-2 text-center">
        <p className="text-[9.5px] text-[#7E6674] leading-tight">
          By registering, you confirm you are bound by DV’S TattvaCo Originals LLP&apos;s NDA &amp;{" "}
          <Link href="/policies" className="text-amber-800 underline font-medium hover:text-amber-900">
            Terms of Service
          </Link>
          .
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. FULL NON-DISCLOSURE AGREEMENT MODAL DIALOG
         ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#F0DCE4] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nda-modal-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F0DCE4] bg-[#FAF5F8] px-4 py-3 sm:px-5">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-600/30 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  <span>✦</span>
                  <span>DV’S TattvaCo Originals LLP</span>
                </span>
                <h3 id="nda-modal-title" className="mt-1 font-serif text-base sm:text-lg font-bold text-[#20101B]">
                  Confidentiality &amp; Non-Disclosure Agreement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="size-7 rounded-full flex items-center justify-center text-[#7E6674] hover:bg-black/5 hover:text-[#20101B] transition-colors cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Scrollable Full Agreement Text */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-3.5 text-xs text-[#3D2C37] leading-relaxed">
              <div className="rounded-lg bg-amber-50/80 border border-amber-200/70 p-3 text-[11px] text-amber-950">
                <strong>Notice:</strong> Please read this agreement in full. Ticking and agreeing to these terms is mandatory before an account can be created.
              </div>

              <div>
                <h4 className="font-semibold text-[#20101B] text-xs uppercase tracking-wider mb-1">
                  1. Confidential Product Status
                </h4>
                <p>
                  I acknowledge and agree that TattvaCo (the “Interface”) is a product currently under development, owned and operated by DV’S TattvaCo Originals LLP (the “Company”), and is therefore a confidential product of the Company. All information accessed through or generated by the Interface, including its features, functionalities, narratives, characters, responses, design and underlying concepts, constitutes strictly confidential and proprietary information of the Company, and I shall treat it accordingly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#20101B] text-xs uppercase tracking-wider mb-1">
                  2. Non-Disclosure &amp; Non-Distribution Undertaking
                </h4>
                <p>
                  By selecting I Agree and Continue, I undertake not to disclose, share, reproduce, screenshot, record, copy, publish, or distribute any part of the interface or its contents, whether publicly or privately, without the Company’s prior written consent. I shall not share my access with any third party, attempt to reverse engineer, replicate, or otherwise misuse the interface, or use any information obtained through it to develop or facilitate the development of any similar or competing product or service.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#20101B] text-xs uppercase tracking-wider mb-1">
                  3. Indefinite Duration &amp; Legal Compliance
                </h4>
                <p>
                  These confidentiality and non-disclosure obligations shall remain in force indefinitely, including after my access to the interface has been terminated or withdrawn. Where disclosure is required by applicable law or a competent authority, I shall, to the extent legally permitted, notify the Company in advance and limit such disclosure to the extent legally required. I shall also delete or return any saved Confidential Information upon the Company’s request, subject to applicable law.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#20101B] text-xs uppercase tracking-wider mb-1">
                  4. Breach &amp; Remedies
                </h4>
                <p>
                  I acknowledge that any breach of these obligations may result in the suspension or termination of my access to the interface.
                </p>
              </div>

              <div className="rounded-md border border-[#F0DCE4] bg-[#FAF5F8] p-2.5 text-[11px] font-semibold text-[#20101B]">
                By selecting I Agree and Continue, I confirm that I have read, understood, and agree to be bound by these terms.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#F0DCE4] bg-[#FAF5F8] px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-[#5A4550] hover:text-[#20101B] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setNdaAgreed(true);
                  setNdaError(false);
                  setIsModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#24131E] hover:bg-[#381C2E] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span>✓</span>
                <span>I Agree and Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
