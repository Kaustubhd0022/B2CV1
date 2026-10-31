"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useReducedMotion } from "motion/react";
import { Notice } from "@/components/ui";
import { PassportStamp3D } from "./passport-stamp-3d";
import { resendVerificationAction, verifyCode } from "../actions";

const STAMP_LANDS_MS = 320;
const EMPTY_CODE = ["", "", "", "", "", ""];

const ERRORS: Record<string, string> = {
  invalid: "That code is incorrect. Check it and try again, or send a new one.",
  expired: "That code has expired. Send a new one below.",
  locked: "Too many incorrect attempts. Wait a moment, then send a new code.",
};

const NOTICES: Record<string, string> = {
  code_resent: "We sent you a new code.",
  email_not_confirmed: "Confirm your email with the 6-digit code we sent you.",
};

interface VerifyCardProps {
  target: string;
  maskedTarget: string;
  channel: "email" | "phone";
  initialNotice?: string;
  initialError?: string;
  isSignUp?: boolean;
}

/** Reports when the server action ends without leaving this page, which means the code was rejected. */
function ActionSettled({ onSettled }: { onSettled: () => void }) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending) onSettled();
    wasPending.current = pending;
  }, [pending, onSettled]);
  return null;
}

function mailboxLink(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain.includes("gmail") || domain.includes("google")) {
    return { label: "Open Gmail", url: "https://mail.google.com/mail/u/0/#inbox" };
  }
  if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live")) {
    return { label: "Open Outlook", url: "https://outlook.live.com/mail/0/" };
  }
  if (domain.includes("yahoo")) {
    return { label: "Open Yahoo Mail", url: "https://mail.yahoo.com/" };
  }
  return null;
}

export function VerifyCard({ target, maskedTarget, channel, initialNotice, initialError, isSignUp }: VerifyCardProps) {
  const reduced = useReducedMotion();
  const [digits, setDigits] = useState<string[]>(EMPTY_CODE);
  const [checking, setChecking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [errorHidden, setErrorHidden] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(initialNotice ? (NOTICES[initialNotice] ?? null) : null);
  const [cooldown, setCooldown] = useState(60);
  const [isResending, startResend] = useTransition();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const code = digits.join("");
  const filled = digits.filter(Boolean).length;
  const urlError = !errorHidden && initialError ? (ERRORS[initialError] ?? null) : null;
  const error = resendError ?? urlError;
  const mailbox = channel === "email" ? mailboxLink(target) : null;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [attempt]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRejected = useCallback(() => {
    setChecking(false);
    setDigits(EMPTY_CODE);
    setErrorHidden(false);
    setAttempt((prev) => prev + 1);
  }, []);

  // The stamp lands before the code is sent, so the press answers the last digit.
  const submitWhenStamped = () => {
    setChecking(true);
    setTimeout(() => formRef.current?.requestSubmit(), reduced ? 0 : STAMP_LANDS_MS);
  };

  const applyCode = (raw: string, startAt: number) => {
    const next = [...digits];
    raw.split("").forEach((digit, offset) => {
      if (startAt + offset < 6) next[startAt + offset] = digit;
    });
    setDigits(next);
    setErrorHidden(true);
    setResendError(null);
    const complete = next.every(Boolean);
    if (complete) submitWhenStamped();
    else inputRefs.current[Math.min(startAt + raw.length, 5)]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((prev) => prev.map((digit, i) => (i === index ? "" : digit)));
      return;
    }
    // Two digits means typing over a filled box; more means browser autofill.
    applyCode(clean.length === 2 ? clean[1] : clean, clean.length > 2 ? 0 : index);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const clean = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (clean) applyCode(clean, 0);
  };

  const handleResend = () => {
    if (cooldown > 0 || isResending) return;
    startResend(async () => {
      setNotice(null);
      setResendError(null);
      setErrorHidden(true);
      const res = await resendVerificationAction().catch(() => ({ ok: false, error: "failed" }));
      if (res.ok) {
        setNotice("We sent you a new code.");
        setCooldown(60);
      } else if (res.error === "rate_limited") {
        setResendError("Too many codes requested. Wait a few minutes, then try again.");
      } else {
        setResendError("We could not send a new code. Try again in a moment.");
      }
    });
  };

  return (
    <div className="w-full max-w-[360px] rounded-2xl border border-[#F0DCE4] bg-white/95 p-4.5 shadow-xl backdrop-blur-xl sm:p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-600/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
          <span>✦</span>
          <span>Cultural Explorer Passport</span>
        </span>
        <span className="text-[10px] font-medium text-[#7E6674]">{isSignUp ? "New Passport" : "Sign in"}</span>
      </div>

      <PassportStamp3D filled={filled} pressed={checking} attempt={attempt} />

      <h1 className="font-serif text-xl font-bold tracking-tight text-[#20101B]">
        {isSignUp ? "Stamp your passport" : channel === "phone" ? "Check your messages" : "Check your email"}
      </h1>
      <p className="mt-0.5 text-[11px] leading-snug text-[#5A4550]">
        Enter the 6-digit code we sent to <span className="font-semibold text-[#20101B]">{maskedTarget}</span>.{" "}
        <Link href="/sign-in" className="font-semibold text-amber-800 underline hover:text-amber-900">
          Change
        </Link>
      </p>

      <div aria-live="polite">
        {error && (
          <Notice tone="error" role="alert" className="mt-2.5 px-2.5 py-1.5 text-[11px]">
            {error}
          </Notice>
        )}
        {notice && !error && (
          <Notice tone="success" role="status" className="mt-2.5 px-2.5 py-1.5 text-[11px]">
            {notice}
          </Notice>
        )}
      </div>

      <form
        ref={formRef}
        action={verifyCode}
        onSubmit={() => setChecking(true)}
        className="mt-3"
      >
        <input type="hidden" name="code" value={code} />
        <ActionSettled onSettled={handleRejected} />

        <div className="flex gap-1.5" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={idx === 0 ? "one-time-code" : "off"}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onFocus={(e) => e.target.select()}
              disabled={checking}
              aria-label={`Digit ${idx + 1}`}
              className={`h-12 w-full min-w-0 flex-1 !rounded-full border bg-white text-center font-serif text-xl font-bold text-[#20101B] shadow-2xs outline-none transition-colors focus:border-amber-700 focus:ring-2 focus:ring-amber-600/25 disabled:opacity-60 ${
                digit ? "border-amber-700/50" : "border-[#E9D5DF]"
              }`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={code.length !== 6 || checking}
          className="mt-3 flex h-10 w-full cursor-pointer items-center justify-center rounded-full bg-[#24131E] text-xs font-semibold text-white transition-colors hover:bg-[#381C2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checking ? "Checking your code…" : "Verify code"}
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[#5A4550]">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className={cooldown > 0 || isResending ? "cursor-not-allowed text-[#7E6674]" : "cursor-pointer font-semibold text-amber-800 underline hover:text-amber-900"}
        >
          {isResending ? "Sending…" : cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
        </button>
        {mailbox && (
          <a href={mailbox.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-800 underline hover:text-amber-900">
            {mailbox.label}
          </a>
        )}
      </div>
      {channel === "email" && <p className="mt-2 text-[10px] text-[#7E6674]">Not there? Check your spam or promotions folder.</p>}
    </div>
  );
}
