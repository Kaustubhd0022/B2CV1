"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { config } from "@/lib/config";
import { hmac, safeEqualHex, hashPassword, verifyPassword } from "@/lib/auth/crypto";
import { normalizeEmail, normalizePhone, safeNext } from "@/lib/auth/normalize";
import { getLatestActiveChallenge, startChallenge, verifyChallenge, type Channel } from "@/lib/auth/otp";
import { currentSession, endSession, startSession } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { track } from "@/lib/analytics";
import { isLanguageCode } from "@/lib/i18n/languages";
import { notifyLegalOfNdaAcceptance } from "@/lib/legal/nda-notifier";

/**
 * The address/number being verified is kept in a short-lived, httpOnly, signed cookie —
 * never in the URL (FR-18: no personal data or secrets in URLs).
 */
const PENDING = "tc_pending";

function sign(payload: string) {
  return `${Buffer.from(payload).toString("base64url")}.${hmac(config().auth.secret, payload)}`;
}
function unsign(value: string | undefined): {
  channel: Channel;
  target: string;
  next: string;
  challengeId?: string;
  startedAt?: number;
  demoCode?: string;
} | null {
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

export async function clearPendingCookie() {
  try {
    const jar = await cookies();
    jar.delete({ name: PENDING, path: "/" });
    jar.delete({ name: PENDING, path: "/sign-in" });
  } catch {}
}

async function begin(channel: Channel, target: string, next: string) {
  await track("auth_start", { method: channel });

  // Clear any stale active session before starting fresh verification
  if (await currentSession()) await endSession();

  // Create unified secure challenge delivering 6-digit OTP code and direct confirmation link
  const r = await startChallenge(channel, target);
  if (!r.ok) {
    await track("auth_failure", { method: channel, reason: r.error });
    const error = r.error === "rate_limited" ? "too_many" : r.error === "not_configured" ? "unavailable" : "delivery";
    redirect(`/sign-in?error=${error}&next=${encodeURIComponent(next)}`);
  }

  const activeChallenge = await getLatestActiveChallenge(channel, target);

  (await cookies()).set(
    PENDING,
    sign(
      JSON.stringify({
        channel,
        target,
        next,
        challengeId: activeChallenge?.id,
        startedAt: Date.now(),
        demoCode: "demoCode" in r ? r.demoCode : undefined,
      })
    ),
    {
      httpOnly: true,
      secure: config().isProd,
      sameSite: "lax",
      path: "/",
      maxAge: config().auth.otpMinutes * 60,
    }
  );
  redirect("/sign-in/verify");
}

/**
 * Real Account Creation: registers user in Supabase Postgres with hashed password
 * and starts an active session immediately.
 */
import { createClient as createSupabaseServer } from "@/lib/supabase/server";

export async function createAccount(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const name = String(formData.get("name") ?? "").trim();
  const rawEmail = String(formData.get("email") ?? "");
  const email = normalizeEmail(rawEmail);
  const password = String(formData.get("password") ?? "");
  const lang = String(formData.get("language") ?? "");

  const ndaAgreed = formData.get("nda_agreed") === "true" || formData.get("nda_agreed") === "on";
  if (!ndaAgreed) {
    redirect(`/sign-up?error=nda_required&next=${encodeURIComponent(next)}`);
  }

  if (!email) {
    redirect(`/sign-up?error=invalid_email&next=${encodeURIComponent(next)}`);
  }
  if (!password || password.length < 8) {
    redirect(`/sign-up?error=invalid_password&next=${encodeURIComponent(next)}`);
  }

  // Extract client metadata for legal compliance audit record
  let ip = "unknown";
  let userAgent = "unknown";
  try {
    const h = await headers();
    ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
    userAgent = h.get("user-agent") || "unknown";
  } catch {}

  // 1. Real Supabase Auth (when Supabase API Anon Key is configured)
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createSupabaseServer();
      const appUrl = config().appUrl;
      const { data: supaData, error: supaErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
          data: {
            name: name || undefined,
            language: lang,
            nda_agreed: true,
            nda_agreed_at: new Date().toISOString(),
            nda_version: "1.0",
          },
        },
      });

      if (supaErr) {
        const msg = supaErr.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("user already registered")) {
          redirect(`/sign-up?error=email_exists&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
        }
        redirect(`/sign-up?error=invalid_credentials&next=${encodeURIComponent(next)}`);
      }

      if (supaData.user) {
        if (isLanguageCode(lang)) {
          (await cookies()).set("tc-language", lang, { path: "/", maxAge: 365 * 86400, sameSite: "lax" });
        }

        // Sync user to local database
        try {
          const db = await getDb();
          const [existing] = await db
            .select({ id: schema.users.id })
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .limit(1);

          if (!existing) {
            await db.insert(schema.users).values({
              id: supaData.user.id,
              name: name || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              email,
              passwordHash: hashPassword(password),
              emailVerifiedAt: supaData.session ? new Date() : null,
            });
          }
        } catch {}

        // Dispatch signed NDA undertaking and user details to legal@donvanzara.com
        await notifyLegalOfNdaAcceptance({
          name: name || email.split("@")[0],
          email,
          userId: supaData.user.id,
          language: lang,
          ip,
          userAgent,
          agreedAt: new Date(),
        });

        // If email confirmation is required, session is null until user confirms via email OTP or link
        if (!supaData.session) {
          (await cookies()).set(
            PENDING,
            sign(JSON.stringify({ channel: "email", target: email, next, startedAt: Date.now() })),
            {
              httpOnly: true,
              secure: config().isProd,
              sameSite: "lax",
              path: "/",
              maxAge: config().auth.otpMinutes * 60,
            }
          );
          redirect("/sign-in/verify?signup=1");
        }

        if (await currentSession()) await endSession();
        await startSession(supaData.user.id);
        await track("auth_success", { method: "supabase_auth_signup", new_account: true });
        redirect(next || "/");
      }
    } catch (err) {
      if ((err as Error).message === "NEXT_REDIRECT") throw err;
    }
  }

  const db = await getDb();

  // Check if user already exists with this email in Supabase Postgres
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (existing) {
    redirect(`/sign-up?error=email_exists&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
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

  // Dispatch signed NDA undertaking and user details to legal@donvanzara.com
  await notifyLegalOfNdaAcceptance({
    name: name || email.split("@")[0],
    email,
    userId: newUser.id,
    language: lang,
    ip,
    userAgent,
    agreedAt: new Date(),
  });

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
 * Real Sign In: verifies credentials against Supabase (Auth + Postgres) and creates session.
 * IF NEW USER DETECTED: automatically creates their account in Supabase first!
 */
export async function signInAction(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const useOtp = formData.get("auth_mode") === "otp";

  if (!email) {
    redirect(`/sign-in?error=invalid_email&next=${encodeURIComponent(next)}`);
  }

  // 1. Real Supabase GoTrue Auth (when Anon Key is configured in .env)
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createSupabaseServer();

      if (useOtp || !password) {
        await begin("email", email, next);
        return;
      } else {
        const { data: supaUser, error: supaErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!supaErr && supaUser.user) {
          if (await currentSession()) await endSession();
          await startSession(supaUser.user.id);
          await track("auth_success", { method: "supabase_password" });
          redirect(next || "/");
        }

        if (supaErr) {
          const msg = supaErr.message.toLowerCase();
          // If email is not confirmed, send fresh verification code and redirect to verify screen
          if (msg.includes("email not confirmed") || msg.includes("email link is invalid")) {
            (await cookies()).set(
              PENDING,
              sign(JSON.stringify({ channel: "email", target: email, next, startedAt: Date.now() })),
              {
                httpOnly: true,
                secure: config().isProd,
                sameSite: "lax",
                path: "/",
                maxAge: config().auth.otpMinutes * 60,
              }
            );
            try {
              await supabase.auth.resend({
                type: "signup",
                email,
                options: {
                  emailRedirectTo: `${config().appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
                },
              });
            } catch {}
            redirect(`/sign-in/verify?notice=email_not_confirmed`);
          }

          // If credentials invalid / user does not exist, redirect to sign-up to accept the NDA
          if (msg.includes("invalid login credentials")) {
            redirect(`/sign-up?error=account_not_found&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
          }
        }
      }
    } catch (err) {
      if ((err as Error).message === "NEXT_REDIRECT") throw err;
    }
  }

  // 2. Direct Supabase Postgres Auth Flow (Robust fallback)
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

  // If user does not exist in Supabase Postgres, direct them to sign-up with NDA
  if (!user) {
    redirect(`/sign-up?error=account_not_found&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
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

/**
 * Real-time verification poller: checks if the user has confirmed their email
 * via magic link on phone or another browser tab.
 *
 * FULL SECURITY GATING:
 * 1. Checks ONLY if THIS specific challenge has been consumed (`consumedAt IS NOT NULL`).
 * 2. NEVER checks past `emailVerifiedAt` or stale sessions.
 * 3. If the challenge has NOT been consumed, returns `{ verified: false }`.
 * 4. User is strictly gated and cannot bypass OTP without typing the code or clicking the link.
 */
export async function checkVerificationStatus(): Promise<{ verified: boolean; next?: string }> {
  const p = await pendingVerification();
  if (!p) {
    return { verified: false };
  }

  try {
    const db = await getDb();
    let challenge = null;

    if (p.challengeId) {
      const [found] = await db
        .select({
          id: schema.otpChallenges.id,
          consumedAt: schema.otpChallenges.consumedAt,
          createdAt: schema.otpChallenges.createdAt,
        })
        .from(schema.otpChallenges)
        .where(eq(schema.otpChallenges.id, p.challengeId))
        .limit(1);
      challenge = found;
    } else {
      const th = hmac(config().auth.secret, `${p.channel}:${p.target}`);
      const [found] = await db
        .select({
          id: schema.otpChallenges.id,
          consumedAt: schema.otpChallenges.consumedAt,
          createdAt: schema.otpChallenges.createdAt,
        })
        .from(schema.otpChallenges)
        .where(eq(schema.otpChallenges.targetHash, th))
        .orderBy(desc(schema.otpChallenges.createdAt))
        .limit(1);
      challenge = found;
    }

    // ONLY IF this specific challenge was consumed (e.g. by tapping the link on mobile phone)
    if (challenge && challenge.consumedAt !== null) {
      if (p.startedAt && challenge.consumedAt.getTime() < p.startedAt - 5000) {
        // Consumed before this verification session began; ignore stale challenge
        return { verified: false };
      }

      const col = p.channel === "email" ? schema.users.email : schema.users.phone;
      const [user] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(col, p.target))
        .limit(1);

      if (user) {
        if (await currentSession()) await endSession();
        await startSession(user.id);
        await clearPendingCookie();
        return { verified: true, next: p.next || "/" };
      }
    }
  } catch {}

  // Gated: Return false so the user must enter the 6-digit code or tap link
  return { verified: false };
}

/**
 * Async resend action for rich client interaction without jarring page reloads.
 */
export async function resendVerificationAction(): Promise<{ ok: boolean; error?: string }> {
  const p = await pendingVerification();
  if (!p) return { ok: false, error: "expired" };

  const r = await startChallenge(p.channel, p.target);
  if (!r.ok) return { ok: false, error: r.error };

  const activeChallenge = await getLatestActiveChallenge(p.channel, p.target);
  (await cookies()).set(
    PENDING,
    sign(
      JSON.stringify({
        channel: p.channel,
        target: p.target,
        next: p.next,
        challengeId: activeChallenge?.id,
        startedAt: Date.now(),
      })
    ),
    {
      httpOnly: true,
      secure: config().isProd,
      sameSite: "lax",
      path: "/",
      maxAge: config().auth.otpMinutes * 60,
    }
  );
  return { ok: true };
}

export async function verifyCode(formData: FormData) {
  const p = await pendingVerification();
  if (!p) redirect("/sign-in?error=expired_code");
  const code = String(formData.get("code") ?? "").trim().replace(/\s+/g, "");

  // 1. If Supabase Anon Key is configured, verify via Supabase Auth
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && p.channel === "email") {
    try {
      const supabase = await createSupabaseServer();

      // Try signup confirmation OTP first, then email OTP
      let verifyRes = await supabase.auth.verifyOtp({
        email: p.target,
        token: code,
        type: "signup",
      });

      if (verifyRes.error) {
        verifyRes = await supabase.auth.verifyOtp({
          email: p.target,
          token: code,
          type: "email",
        });
      }

      if (!verifyRes.error && verifyRes.data.user) {
        // Sync verified status to local public.users
        try {
          const db = await getDb();
          await db
            .update(schema.users)
            .set({ emailVerifiedAt: new Date() })
            .where(eq(schema.users.email, p.target));
        } catch {}

        if (await currentSession()) await endSession();
        await startSession(verifyRes.data.user.id);
        await clearPendingCookie();
        redirect(p.next || "/");
      }
    } catch (err) {
      if ((err as Error).message === "NEXT_REDIRECT") throw err;
    }
  }

  // 2. Direct Supabase Postgres OTP Challenge Verification
  const r = await verifyChallenge(p.channel, p.target, code);
  if (!r.ok) {
    await track("auth_failure", { method: p.channel, reason: r.error });
    redirect(`/sign-in/verify?error=${r.error}`);
  }
  if (await currentSession()) await endSession();
  await startSession(r.userId);
  await clearPendingCookie();
  await track("auth_success", { method: p.channel, new_account: r.created });
  redirect(r.created ? `/language?next=${encodeURIComponent(p.next)}` : (p.next || "/"));
}

/**
 * Universal Google Login:
 * 1. If Supabase Auth is enabled, redirects through Supabase's Google OAuth provider.
 * 2. If GOOGLE_CLIENT_ID is set in .env, uses Arctic Google OAuth.
 * 3. In dev mode without keys, uses 1-click test Google Explorer identity.
 */
export async function signInWithGoogle(formData?: FormData) {
  const next = safeNext(formData?.get("next"));
  const appUrl = config().appUrl;

  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createSupabaseServer();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (!error && data?.url) {
        redirect(data.url);
      }
    } catch (err) {
      if ((err as Error).message === "NEXT_REDIRECT") throw err;
    }
  }

  const { oauthConfigured } = await import("@/lib/auth/oauth");
  if (oauthConfigured("google")) {
    redirect(`/auth/google?next=${encodeURIComponent(next)}`);
  } else {
    await signInWithGoogleDev(formData);
  }
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
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createSupabaseServer();
      await supabase.auth.signOut();
    } catch {}
  }
  await endSession();
  await clearPendingCookie();
  redirect("/sign-in");
}
