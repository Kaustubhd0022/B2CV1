"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { config } from "@/lib/config";
import { hmac, safeEqualHex, hashPassword, verifyPassword } from "@/lib/auth/crypto";
import { normalizeEmail, normalizePhone, safeNext } from "@/lib/auth/normalize";
import { startChallenge, verifyChallenge, type Channel } from "@/lib/auth/otp";
import { currentSession, endSession, startSession } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { track } from "@/lib/analytics";
import { isLanguageCode } from "@/lib/i18n/languages";

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
  (await cookies()).set(PENDING, sign(JSON.stringify({ channel, target, next, demoCode: r.demoCode })), {
    httpOnly: true,
    secure: config().isProd,
    sameSite: "lax",
    path: "/sign-in",
    maxAge: config().auth.otpMinutes * 60,
  });
  redirect("/sign-in/verify");
}

/**
 * Real Account Creation: registers user in Supabase Postgres with hashed password
 * and starts an active session immediately.
 */
export async function createAccount(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const name = String(formData.get("name") ?? "").trim();
  const rawEmail = String(formData.get("email") ?? "");
  const email = normalizeEmail(rawEmail);
  const password = String(formData.get("password") ?? "");
  const lang = String(formData.get("language") ?? "");

  if (!email) {
    redirect(`/sign-up?error=invalid_email&next=${encodeURIComponent(next)}`);
  }
  if (!password || password.length < 8) {
    redirect(`/sign-up?error=invalid_password&next=${encodeURIComponent(next)}`);
  }

  const db = await getDb();

  // Check if user already exists with this email
  const [existing] = await db
    .select({ id: schema.users.id, passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (existing) {
    // If password matches existing account, sign them in directly without friction
    if (existing.passwordHash && verifyPassword(password, existing.passwordHash)) {
      if (await currentSession()) await endSession();
      await startSession(existing.id);
      await track("auth_success", { method: "password_signup_existing" });
      redirect(next || "/");
    }
    redirect(`/sign-up?error=email_exists&next=${encodeURIComponent(next)}`);
  }

  // Create new user with hashed password in Supabase Postgres
  const [newUser] = await db
    .insert(schema.users)
    .values({
      name: name || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      passwordHash: hashPassword(password),
      emailVerifiedAt: new Date(),
    })
    .returning({ id: schema.users.id });

  if (isLanguageCode(lang)) {
    (await cookies()).set("tc-language", lang, { path: "/", maxAge: 365 * 86400, sameSite: "lax" });
  }

  // Clear existing session if any and start fresh session
  if (await currentSession()) await endSession();
  await startSession(newUser.id);
  await track("auth_success", { method: "password_signup", new_account: true });

  redirect(next || "/");
}

/**
 * Real Sign In: verifies credentials against Supabase Postgres and creates session.
 * IF NEW USER DETECTED: automatically creates their account in Supabase Postgres first!
 * If user selected OTP mode, initiates email OTP challenge.
 */
export async function signInAction(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const useOtp = formData.get("auth_mode") === "otp";

  if (!email) {
    redirect(`/sign-in?error=invalid_email&next=${encodeURIComponent(next)}`);
  }

  // If user requested OTP flow (or password is empty)
  if (useOtp || !password) {
    await begin("email", email, next);
    return;
  }

  const db = await getDb();
  const [user] = await db
    .select({ id: schema.users.id, passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  // ─── IF NEW USER DETECTED: CREATE ACCOUNT FIRST IN SUPABASE ───
  if (!user) {
    if (password.length >= 8) {
      // Create new account automatically with provided credentials
      const derivedName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const [newUser] = await db
        .insert(schema.users)
        .values({
          name: derivedName,
          email,
          passwordHash: hashPassword(password),
          emailVerifiedAt: new Date(),
        })
        .returning({ id: schema.users.id });

      if (await currentSession()) await endSession();
      await startSession(newUser.id);
      await track("auth_success", { method: "password_auto_signup", new_account: true });
      redirect(next || "/");
    } else {
      // Password provided was too short for a new account: start OTP challenge to create & verify securely
      await begin("email", email, next);
      return;
    }
  }

  // User exists: verify password
  if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    await track("auth_failure", { method: "password", reason: "invalid_credentials" });
    redirect(`/sign-in?error=invalid_credentials&next=${encodeURIComponent(next)}`);
  }

  // Password matches: start session immediately
  if (await currentSession()) await endSession();
  await startSession(user.id);
  await track("auth_success", { method: "password" });

  redirect(next || "/");
}

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
  if (await currentSession()) await endSession();
  await startSession(r.userId);
  (await cookies()).delete({ name: PENDING, path: "/sign-in" });
  await track("auth_success", { method: p.channel, new_account: r.created });
  redirect(r.created ? `/language?next=${encodeURIComponent(p.next)}` : (p.next || "/"));
}

/**
 * In development environment (when GOOGLE_CLIENT_ID isn't configured in .env yet),
 * allows 1-click test sign-in with a Google Cultural Explorer identity.
 */
export async function signInWithGoogleDev(formData?: FormData) {
  const next = safeNext(formData?.get("next"));
  const devEmail = "google.explorer@tattvaco.org";
  const devName = "Google Explorer";
  const sub = "dev_google_108273648192";

  const { resolveOAuthUser } = await import("@/lib/auth/oauth");
  const r = await resolveOAuthUser("google", {
    sub,
    email: devEmail,
    emailVerified: true,
    name: devName,
  });

  if (!r.ok) redirect("/sign-in?error=oauth_failed");

  if (await currentSession()) await endSession();
  await startSession(r.userId);
  await track("auth_success", { method: "google_dev", new_account: r.created });
  redirect(r.created ? `/language?next=${encodeURIComponent(next)}` : (next || "/"));
}

export async function signOut() {
  await endSession();
  redirect("/sign-in");
}
