import "server-only";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { config } from "@/lib/config";
import { getDb, schema } from "@/lib/db/client";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";
import { randomToken, sha256 } from "./crypto";

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
  const db = await getDb();
  await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, sha256(token)));
}

export async function deleteAllSessionsForUser(userId: string) {
  const db = await getDb();
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}

export async function purgeExpiredSessions() {
  const db = await getDb();
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
}

export async function setSessionLanguage(sessionId: string, language: LanguageCode) {
  const db = await getDb();
  await db.update(schema.sessions).set({ language }).where(eq(schema.sessions.id, sessionId));
}

/* ---------------- Request-bound helpers ---------------- */

export async function startSession(userId: string) {
  const { token, expiresAt } = await createSessionRecord(userId);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config().isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function currentSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return findSessionByToken(token);
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
