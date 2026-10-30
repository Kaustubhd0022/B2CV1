"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { PassportSeal3D } from "./passport-seal-3d";
import { checkVerificationStatus, resendVerificationAction, verifyCode } from "../actions";

interface VerifyCardProps {
  target: string;
  maskedTarget: string;
  channel: "email" | "phone";
  next: string;
  initialNotice?: string;
  initialError?: string;
  isSignUp?: boolean;
}

export function VerifyCard({
  target,
  maskedTarget,
  channel,
  next,
  initialNotice,
  initialError,
  isSignUp,
}: VerifyCardProps) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const [status, setStatus] = useState<"waiting" | "verifying" | "verified">("waiting");
  const [errorMsg, setErrorMsg] = useState<string | null>(
    initialError === "invalid"
      ? "Invalid 6-digit code. Please check your email or request a fresh one."
      : initialError === "expired"
      ? "This code has expired. We can send you a new one below."
      : initialError === "locked"
      ? "Too many incorrect attempts. Please wait a moment before trying again."
      : null
  );
  const [noticeMsg, setNoticeMsg] = useState<string | null>(
    initialNotice === "code_resent"
      ? "✓ A fresh verification link & code has been dispatched to your inbox."
      : initialNotice === "email_not_confirmed"
      ? "✉ Please confirm your email using the link or 6-digit code sent to you."
      : null
  );

  // Resend countdown timer (default 60s)
  const [cooldown, setCooldown] = useState(60);
  const [isPendingResend, startResend] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus first input box on load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Real-Time Poller: Listens for Magic Link confirmation in the user's email
  // If the user clicks the link in their email on another tab or mobile phone,
  // this poller auto-detects it and unlocks their passport immediately!
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "verified") return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await checkVerificationStatus();
        if (res.verified && isSubscribed) {
          setStatus("verified");
          setNoticeMsg("✦ Email confirmed! Unlocking your Cultural Explorer Passport...");
          setErrorMsg(null);
          setTimeout(() => {
            window.location.href = res.next || next || "/";
          }, 1200);
        }
      } catch {
        // Polling network blip - continue listening gracefully
      }
    }, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [status, next]);

  // Handle single digit input
  const handleDigitChange = (index: number, val: string) => {
    // Clean to numeric only
    const clean = val.replace(/[^0-9]/g, "");
    if (!clean) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    // Handle multiple digits pasted into a single box
    if (clean.length > 1) {
      handlePastedCode(clean);
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = clean;
    setDigits(nextDigits);

    // Auto-advance to next box
    if (index < 5 && clean) {
      inputRefs.current[index + 1]?.focus();
    }

    // If 6 digits complete, auto-submit
    const complete = nextDigits.join("");
    if (complete.length === 6 && !nextDigits.includes("")) {
      triggerSubmit();
    }
  };

  // Backspace auto-retreat
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle clipboard paste of 6-digit code
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    handlePastedCode(pasted);
  };

  const handlePastedCode = (raw: string) => {
    const clean = raw.replace(/[^0-9]/g, "").slice(0, 6);
    if (!clean) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = clean[i] || "";
    }
    setDigits(nextDigits);

    // Focus last filled index or next empty
    const nextFocus = Math.min(clean.length, 5);
    inputRefs.current[nextFocus]?.focus();

    if (clean.length === 6) {
      triggerSubmit();
    }
  };

  const triggerSubmit = () => {
    setStatus("verifying");
    setIsSubmitting(true);
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 150);
  };

  // Resend action
  const handleResend = () => {
    if (cooldown > 0 || isPendingResend) return;
    startResend(async () => {
      try {
        const res = await resendVerificationAction();
        if (res.ok) {
          setNoticeMsg("✓ A fresh verification link & code was sent to your email.");
          setErrorMsg(null);
          setCooldown(60);
        } else {
          setErrorMsg("Could not resend at this moment. Please try again shortly.");
        }
      } catch {
        setErrorMsg("Failed to dispatch code. Please try again.");
      }
    });
  };

  // Detect mailbox provider for quick 1-tap open
  const getMailboxLink = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase() || "";
    if (domain.includes("gmail") || domain.includes("google")) {
      return {
        label: "Open Gmail",
        url: "https://mail.google.com/mail/u/0/#search/from%3Atattvaco+OR+from%3Asupabase+OR+verify",
      };
    }
    if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live")) {
      return {
        label: "Open Outlook",
        url: "https://outlook.live.com/mail/0/",
      };
    }
    if (domain.includes("yahoo")) {
      return {
        label: "Open Yahoo Mail",
        url: "https://mail.yahoo.com/",
      };
    }
    return {
      label: "Open Mail App",
      url: `mailto:${email}`,
    };
  };

  const mailbox = getMailboxLink(target);
  const fullCode = digits.join("");

  return (
    <div className="relative w-full max-w-[460px] rounded-3xl border border-[#C9822B]/35 bg-[#141E18]/90 p-6 sm:p-8 shadow-[0_25px_65px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-white">
      {/* ─────────────────────────────────────────────────────────────
          Top 3D Cultural Talisman Animation Stage
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center">
        <PassportSeal3D status={status} className="mb-3" />

        {/* Brand Chip */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
          <span>✦</span>
          <span>Cultural Explorer Passport</span>
          <span>✦</span>
        </div>

        {/* Heading */}
        <h1 className="mt-3 font-serif text-2xl sm:text-[26px] font-bold tracking-tight text-white text-center">
          {status === "verified"
            ? "Passport Verified!"
            : isSignUp
            ? "Activate Your Passport"
            : "Verify Your Email"}
        </h1>

        {/* Target display with Edit link */}
        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-white/80">
          <span>Sent to:</span>
          <span className="font-mono font-semibold text-amber-200">{maskedTarget}</span>
          <Link
            href="/sign-in"
            className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2 ml-1"
            title="Use a different email address"
          >
            Change
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Dual-Path Clarification (Solves the "Link vs Code" Mismatch)
         ───────────────────────────────────────────────────────────── */}
      <div className="mt-5 space-y-3">
        {/* Method A: Direct Magic Link with Live Beacon */}
        <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-amber-200">
                1-Tap Email Link Active
              </span>
            </div>
            <a
              href={mailbox.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/30 transition-colors"
            >
              <span>{mailbox.label}</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>

          <p className="mt-2 text-xs text-white/85 leading-relaxed">
            Tap the confirmation button in your email. This window will <strong>auto-detect</strong> it and unlock your passport instantly — no typing needed.
          </p>
        </div>

        {/* Notices and Alerts */}
        <AnimatePresence>
          {noticeMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-2.5 text-xs text-emerald-200"
            >
              {noticeMsg}
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-200"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Method B: 6-Digit Discrete OTP Boxes
         ───────────────────────────────────────────────────────────── */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-white/70 mb-2.5 px-0.5">
          <span className="font-medium text-amber-100/90">Or enter 6-digit verification code:</span>
          <span className="text-[10px] text-white/50 uppercase tracking-widest">Instant verify</span>
        </div>

        <form
          ref={formRef}
          action={verifyCode}
          onSubmit={() => {
            setStatus("verifying");
            setIsSubmitting(true);
          }}
          className="space-y-4"
        >
          {/* Hidden complete code input for form submission to server action */}
          <input type="hidden" name="code" value={fullCode} />

          {/* 6 Individual Sculpted Digit Input Boxes */}
          <div
            className="flex items-center justify-between gap-2 sm:gap-2.5"
            onPaste={handlePaste}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={1}
                placeholder="·"
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={status === "verified" || isSubmitting}
                className="w-11 h-14 sm:w-13 sm:h-15 text-center rounded-xl border border-amber-500/40 bg-[#16231C]/90 font-mono text-2xl sm:text-3xl font-bold text-amber-300 placeholder:text-amber-500/30 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] hover:border-amber-400/60 focus:border-amber-400 focus:bg-[#1C2C23] focus:outline-none focus:ring-4 focus:ring-amber-500/25 transition-all disabled:opacity-50"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {/* Verify & Continue Button */}
          <button
            type="submit"
            disabled={fullCode.length !== 6 || isSubmitting || status === "verified"}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-[#141E18] font-semibold text-sm shadow-[0_4px_16px_rgba(201,130,43,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "verifying" ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-[#141E18] border-t-transparent" />
                <span>Verifying Passport...</span>
              </>
            ) : status === "verified" ? (
              <span>✦ Passport Activated!</span>
            ) : (
              <span>Verify & Continue →</span>
            )}
          </button>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Footer Controls: Resend & Troubleshoot
         ───────────────────────────────────────────────────────────── */}
      <div className="mt-5 border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Resend Action */}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isPendingResend}
          className={`cursor-pointer transition-colors ${
            cooldown > 0
              ? "text-white/40 cursor-not-allowed"
              : "text-amber-300 hover:text-amber-200 underline underline-offset-2"
          }`}
        >
          {isPendingResend
            ? "Sending fresh email..."
            : cooldown > 0
            ? `Resend link & code in ${cooldown}s`
            : "Didn't receive it? Resend now"}
        </button>

        {/* Change Account / Return */}
        <Link
          href="/sign-in"
          className="text-white/60 hover:text-white transition-colors"
        >
          ← Use different account
        </Link>
      </div>

      {/* Troubleshooting hint */}
      <p className="mt-3 text-[11px] text-white/40 text-center">
        Tip: Check your spam or promotions folder if the email doesn't appear within 30 seconds.
      </p>
    </div>
  );
}
