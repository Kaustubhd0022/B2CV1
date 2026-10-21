import "server-only";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { config } from "@/lib/config";
import { getDb, schema } from "@/lib/db/client";
import { createHash } from "node:crypto";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";
import { hmac, randomToken, safeEqualHex, sha256 } from "./crypto";

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
  const secret = config().auth.secret || "dev-only-secret-do-not-use-in-production";
  const expiresAt = Date.now() + days * 86_400_000;
  const payload = `${userId}:${role}:${language}:${expiresAt}`;
  const sig = hmac(secret, payload);
  return `tc_${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifySignedToken(token: string): SessionUser | null {
  try {
    if (!token.startsWith("tc_") || !token.includes(".")) return null;
    const [prefixedPayload, sig] = token.split(".");
    const b64 = prefixedPayload.replace(/^tc_/, "");
    const payload = Buffer.from(b64, "base64url").toString("utf-8");
    const [userId, role, lang, expStr] = payload.split(":");
    const expiresAt = Number(expStr);
    if (!userId || !expStr || Number.isNaN(expiresAt) || expiresAt < Date.now()) return null;

    const secret = config().auth.secret || "dev-only-secret-do-not-use-in-production";
    const expectedSig = hmac(secret, payload);
    if (!safeEqualHex(sig, expectedSig)) return null;

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

export async function startSession(userId: string, role: "user" | "editor" = "user", language: LanguageCode = "en") {
  const signedToken = createSignedToken(userId, role, language, config().auth.sessionDays);
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
    await db.insert(schema.sessions).values({ tokenHash: sha256(signedToken), userId, expiresAt, language });
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
    // If user has selected a language preference, allow guest explorer access
    if (isLanguageCode(langCookie)) {
      return {
        sessionId: toDeterministicUuid("guest-explorer-session"),
        analyticsId: "anon-explorer",
        userId: toDeterministicUuid("guest-explorer-user"),
        role: "user",
        email: "explorer@tattvaco.org",
        phone: null,
        language: langCookie,
      };
    }
    return null;
  }

  // 1. Try stateless cryptographic verification first (works across serverless lambdas)
  const signedUser = verifySignedToken(token);
  if (signedUser) {
    const langCookie = (await cookies()).get("tc-language")?.value;
    if (isLanguageCode(langCookie)) {
      signedUser.language = langCookie;
    }
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
}

/** Path the user was trying to reach; set by src/proxy.ts. */
async function requestedPath() {
  return (await headers()).get("x-tc-path") ?? "/";
}

/** Protects a page (FR-01). Redirects to sign-in preserving the destination. */
export async function requireUser(): Promise<SessionUser> {
  const s = await currentSession();
  if (!s) redirect(`/sign-in?next=${encodeURIComponent(await requestedPath())}&reason=expired`);
  return s;
}

/** Protects a page and ensures a session language has been chosen. */
export async function requireUserWithLanguage(): Promise<SessionUser & { language: LanguageCode }> {
  const s = await requireUser();
  if (!s.language) redirect(`/language?next=${encodeURIComponent(await requestedPath())}`);
  return s as SessionUser & { language: LanguageCode };
}

export async function requireEditor(): Promise<SessionUser> {
  const s = await requireUser();
  // Not-found rather than a redirect, so the editorial area isn't advertised to users.
  if (s.role !== "editor") notFound();
  return s;
}
