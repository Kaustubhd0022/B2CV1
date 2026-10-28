"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { hmac, safeEqualHex } from "@/lib/auth/crypto";
import { normalizeEmail, normalizePhone, safeNext } from "@/lib/auth/normalize";
import { startChallenge, verifyChallenge, type Channel } from "@/lib/auth/otp";
import { currentSession, endSession, startSession } from "@/lib/auth/session";
import { track } from "@/lib/analytics";

/**
 * The address/number being verified is kept in a short-lived, httpOnly, signed cookie —
 * never in the URL (FR-18: no personal data or secrets in URLs).
 */
const PENDING = "tc_pending";

function sign(payload: string) {
  return `${Buffer.from(payload).toString("base64url")}.${hmac(config().auth.secret, payload)}`;
}
function unsign(value: string | undefined): { channel: Channel; target: string; next: string; demoCode?: string } | null {
  if (!value) return null;
  const [b64, mac] = value.split(".");
  const payload = Buffer.from(b64 ?? "", "base64url").toString();
  if (!mac || !/^[0-9a-f]{64}$/.test(mac) || !safeEqualHex(hmac(config().auth.secret, payload), mac)) return null;
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function pendingVerification() {
  return unsign((await cookies()).get(PENDING)?.value);
}

async function begin(channel: Channel, target: string, next: string) {
  await track("auth_start", { method: channel });
  const r = await startChallenge(channel, target);
  if (!r.ok) {
    await track("auth_failure", { method: channel, reason: r.error });
    const error = r.error === "rate_limited" ? "too_many" : r.error === "not_configured" ? "unavailable" : "delivery";
    redirect(`/sign-in?error=${error}&next=${encodeURIComponent(next)}`);
  }
  // Demo mode only: the code travels in this signed, httpOnly cookie so the verify page can show it.
  (await cookies()).set(PENDING, sign(JSON.stringify({ channel, target, next, demoCode: r.demoCode })), {
    httpOnly: true,
    secure: config().isProd,
    sameSite: "lax",
    path: "/sign-in",
    maxAge: config().auth.otpMinutes * 60,
  });
  redirect("/sign-in/verify");
}

import { isLanguageCode } from "@/lib/i18n/languages";

export async function startEmail(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const lang = String(formData.get("language") ?? "");
  if (isLanguageCode(lang)) {
    (await cookies()).set("tc-language", lang, { path: "/", maxAge: 365 * 86400, sameSite: "lax" });
  }
  if (!email) redirect(`/sign-in?error=invalid_email&next=${encodeURIComponent(next)}`);
  await begin("email", email, next);
}

export async function startPhone(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const lang = String(formData.get("language") ?? "");
  if (isLanguageCode(lang)) {
    (await cookies()).set("tc-language", lang, { path: "/", maxAge: 365 * 86400, sameSite: "lax" });
  }
  if (!phone) redirect(`/sign-in?error=invalid_phone&next=${encodeURIComponent(next)}`);
  await begin("phone", phone, next);
}

export async function resendCode() {
  const p = await pendingVerification();
  if (!p) redirect("/sign-in");
  await begin(p.channel, p.target, p.next);
}

export async function verifyCode(formData: FormData) {
  const p = await pendingVerification();
  if (!p) redirect("/sign-in?error=expired_code");
  const r = await verifyChallenge(p.channel, p.target, String(formData.get("code") ?? ""));
  if (!r.ok) {
    await track("auth_failure", { method: p.channel, reason: r.error });
    redirect(`/sign-in/verify?error=${r.error}`);
  }
  // A fresh session per sign-in: no previous session (or its AI context) is reused.
  if (await currentSession()) await endSession();
  await startSession(r.userId);
  (await cookies()).delete({ name: PENDING, path: "/sign-in" });
  await track("auth_success", { method: p.channel, new_account: r.created });
  redirect(`/language?next=${encodeURIComponent(p.next)}`);
}

export async function signOut() {
  await endSession();
  redirect("/sign-in");
}
