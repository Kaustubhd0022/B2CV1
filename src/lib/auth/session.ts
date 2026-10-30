import "server-only";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { config } from "@/lib/config";
import { getDb, schema } from "@/lib/db/client";
import { createHash } from "node:crypto";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";
import { hasAcceptedNda } from "@/lib/legal/nda-record";
import { hmac, randomToken, sha256 } from "./crypto";
import { readSignedToken, signingSecret } from "./signed-token";

export const SESSION_COOKIE = "tc_session";

export type SessionUser = {
  sessionId: string;
  analyticsId: string;
  userId: string;
  role: "user" | "editor";
  email: string | null;
  phone: string | null;
  language: LanguageCode | null;
};

function toDeterministicUuid(str: string): string {
  const hex = createHash("md5").update(str).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/* ---------------- Stateless signed session helpers (resilient across serverless lambdas) ---------------- */

export function createSignedToken(userId: string, role: "user" | "editor" = "user", language: LanguageCode = "en", days = 14) {
  const expiresAt = Date.now() + days * 86_400_000;
  const payload = `${userId}:${role}:${language}:${expiresAt}`;
  const sig = hmac(signingSecret(), payload);
  return `tc_${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifySignedToken(token: string): SessionUser | null {
  try {
    const verified = readSignedToken(token);
    if (!verified) return null;
    const { userId, role, lang, sig } = verified;

    const finalUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
      ? userId
      : toDeterministicUuid(`user:${userId}`);

    return {
      sessionId: toDeterministicUuid(`sess:${sig}`),
      analyticsId: `anon_${sig.slice(16, 32)}`,
      userId: finalUserId,
      role: (role === "editor" ? "editor" : "user") as "user" | "editor",
      email: `${userId}@tattvaco.org`,
      phone: null,
      language: isLanguageCode(lang) ? lang : "en",
    };
  } catch {
    return null;
  }
}

/* ---------------- Pure DB operations (testable without a request) ---------------- */

export async function createSessionRecord(userId: string) {
  const db = await getDb();
  const token = randomToken();
  const expiresAt = new Date(Date.now() + config().auth.sessionDays * 86_400_000);
  await db.insert(schema.sessions).values({ tokenHash: sha256(token), userId, expiresAt });
  return { token, expiresAt };
}

export async function findSessionByToken(token: string): Promise<SessionUser | null> {
  const db = await getDb();
  const [row] = await db
    .select({
      sessionId: schema.sessions.id,
      analyticsId: schema.sessions.analyticsId,
      language: schema.sessions.language,
      userId: schema.users.id,
      role: schema.users.role,
      email: schema.users.email,
      phone: schema.users.phone,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.tokenHash, sha256(token)), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;
  return { ...row, language: isLanguageCode(row.language) ? row.language : null };
}

export async function deleteSessionByToken(token: string) {
  try {
    const db = await getDb();
    await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, sha256(token)));
  } catch {}
}

export async function deleteAllSessionsForUser(userId: string) {
  try {
    const db = await getDb();
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
  } catch {}
}

export async function purgeExpiredSessions() {
  try {
    const db = await getDb();
    await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
  } catch {}
}

export async function setSessionLanguage(sessionId: string, language: LanguageCode) {
  try {
    const user = await currentSession();
    if (user) {
      const signedToken = createSignedToken(user.userId, user.role, language, config().auth.sessionDays);
      const expiresAt = new Date(Date.now() + config().auth.sessionDays * 86_400_000);
      (await cookies()).set(SESSION_COOKIE, signedToken, {
        httpOnly: true,
        secure: config().isProd,
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      });
    }
  } catch {}
  try {
    const db = await getDb();
    await db.update(schema.sessions).set({ language }).where(eq(schema.sessions.id, sessionId));
  } catch {}
}

/* ---------------- Request-bound helpers ---------------- */

export async function startSession(userId: string, role?: "user" | "editor", language?: LanguageCode) {
  let finalRole = role;
  if (!finalRole) {
    // The role is carried in the signed token, so it has to come from the account at sign-in.
    try {
      const db = await getDb();
      const [account] = await db.select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      finalRole = account?.role;
    } catch {}
  }
  let lang = language;
  if (!lang) {
    try {
      const jar = await cookies();
      const cookieLang = jar.get("tc-language")?.value;
      if (isLanguageCode(cookieLang)) lang = cookieLang;
    } catch {}
  }
  const finalLang: LanguageCode = lang || "en";
  const signedToken = createSignedToken(userId, finalRole ?? "user", finalLang, config().auth.sessionDays);
  const expiresAt = new Date(Date.now() + config().auth.sessionDays * 86_400_000);

  try {
    (await cookies()).set(SESSION_COOKIE, signedToken, {
      httpOnly: true,
      secure: config().isProd,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  } catch {}

  try {
    const db = await getDb();
    await db.insert(schema.sessions).values({ tokenHash: sha256(signedToken), userId, expiresAt, language: finalLang });
  } catch {}
}

export async function currentSession(): Promise<SessionUser | null> {
  let token: string | undefined;
  let langCookie: string | undefined;

  try {
    const jar = await cookies();
    token = jar.get(SESSION_COOKIE)?.value;
    langCookie = jar.get("tc-language")?.value;
  } catch {
    // Outside request scope (e.g. unit tests)
    return null;
  }

  if (!token) {
    // Check if valid Supabase SSR auth user exists
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createClient: createSupabaseServer } = await import("@/lib/supabase/server");
        const supabase = await createSupabaseServer();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const lang = isLanguageCode(langCookie) ? langCookie : "en";
          try {
            await startSession(user.id, undefined, lang);
          } catch {}
          return {
            sessionId: user.id,
            analyticsId: `sb_${user.id.slice(0, 12)}`,
            userId: user.id,
            role: "user",
            email: user.email ?? null,
            phone: user.phone ?? null,
            language: lang,
          };
        }
      } catch {}
    }
    // No session: unauthenticated
    return null;
  }

  // 1. Try stateless cryptographic verification first (works across serverless lambdas)
  const signedUser = verifySignedToken(token);
  if (signedUser) {
    const langCookie = (await cookies()).get("tc-language")?.value;
    if (isLanguageCode(langCookie)) {
      signedUser.language = langCookie;
    }
    try {
      const db = await getDb();
      const [u] = await db
        .select({ email: schema.users.email, phone: schema.users.phone })
        .from(schema.users)
        .where(eq(schema.users.id, signedUser.userId))
        .limit(1);
      if (u?.email) signedUser.email = u.email;
      if (u?.phone) signedUser.phone = u.phone;
    } catch {}
    return signedUser;
  }

  // 2. Database lookup for legacy random tokens
  try {
    const dbUser = await findSessionByToken(token);
    if (dbUser) return dbUser;
  } catch {}

  return null;
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await deleteSessionByToken(token);
  jar.delete(SESSION_COOKIE);
  jar.delete({ name: "tc_pending", path: "/" });
  jar.delete({ name: "tc_pending", path: "/sign-in" });
}

/** Path the user was trying to reach; set by src/proxy.ts. */
async function requestedPath() {
  return (await headers()).get("x-tc-path") ?? "/";
}

/** Protects a page (FR-01). Redirects to sign-in preserving the destination. */
export async function requireUser(): Promise<SessionUser> {
  const s = await currentSession();
  if (!s) {
    try {
      (await cookies()).delete(SESSION_COOKIE);
    } catch {}
    const p = await requestedPath();
    const nextQuery = p && p !== "/" ? `?next=${encodeURIComponent(p)}&reason=expired` : "?reason=expired";
    redirect(`/sign-in${nextQuery}`);
  }
  // Every sign-in path can create an account, so the NDA is enforced here rather than at sign-up.
  if (!(await hasAcceptedNda(s.userId))) {
    const p = await requestedPath();
    redirect(p && p !== "/" ? `/nda?next=${encodeURIComponent(p)}` : "/nda");
  }
  return s;
}

/** Protects a page and ensures a session language has been chosen. */
export async function requireUserWithLanguage(): Promise<SessionUser & { language: LanguageCode }> {
  const s = await requireUser();
  if (!s.language) {
    const p = await requestedPath();
    const nextQuery = p && p !== "/" ? `?next=${encodeURIComponent(p)}` : "";
    redirect(`/language${nextQuery}`);
  }
  return s as SessionUser & { language: LanguageCode };
}

export async function requireEditor(): Promise<SessionUser> {
  const s = await requireUser();
  // Not-found rather than a redirect, so the editorial area isn't advertised to users.
  if (s.role !== "editor") notFound();
  return s;
}
