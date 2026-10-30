import "server-only";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { config } from "@/lib/config";
import { getDb, schema } from "@/lib/db/client";
import { generateOtp, hmac, safeEqualHex } from "./crypto";
import { sendEmailCode, sendSmsCode } from "./delivery";

export type Channel = "email" | "phone";

const WINDOW_MINUTES = 15;
const MAX_CHALLENGES_PER_WINDOW = 5;

const targetHash = (channel: Channel, target: string) => hmac(config().auth.secret, `${channel}:${target}`);
const codeHash = (challengeTarget: string, code: string) => hmac(config().auth.secret, `${challengeTarget}:${code}`);

export type StartResult = { ok: true; demoCode?: string } | { ok: false; error: "rate_limited" | "not_configured" | "provider_error" };

/** Creates a challenge and delivers the code. `target` must already be normalised. */
export async function startChallenge(channel: Channel, target: string): Promise<StartResult> {
  const db = await getDb();
  const c = config();
  const th = targetHash(channel, target);
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60_000);
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.otpChallenges)
    .where(and(eq(schema.otpChallenges.targetHash, th), gt(schema.otpChallenges.createdAt, windowStart)));
  if (n >= MAX_CHALLENGES_PER_WINDOW) return { ok: false, error: "rate_limited" };

  const code = generateOtp();
  // Invalidate earlier open challenges so only the newest code works.
  await db
    .update(schema.otpChallenges)
    .set({ consumedAt: new Date() })
    .where(and(eq(schema.otpChallenges.targetHash, th), isNull(schema.otpChallenges.consumedAt)));
  await db
    .insert(schema.otpChallenges)
    .values({
      channel,
      targetHash: th,
      codeHash: codeHash(th, code),
      expiresAt: new Date(Date.now() + c.auth.otpMinutes * 60_000),
    });

  const sent =
    channel === "email"
      ? await sendEmailCode(target, code)
      : await sendSmsCode(target, code, c.auth.otpMinutes);
  if (!sent.ok) return { ok: false, error: sent.reason };
  return sent.demoCode ? { ok: true, demoCode: sent.demoCode } : { ok: true };
}

export type VerifyResult = { ok: true; userId: string; created: boolean } | { ok: false; error: "invalid" | "expired" | "locked" };

export async function verifyChallenge(channel: Channel, target: string, code: string): Promise<VerifyResult> {
  const db = await getDb();
  const c = config();
  const th = targetHash(channel, target);
  const [challenge] = await db
    .select()
    .from(schema.otpChallenges)
    .where(and(eq(schema.otpChallenges.targetHash, th), isNull(schema.otpChallenges.consumedAt)))
    .orderBy(desc(schema.otpChallenges.createdAt))
    .limit(1);
  if (!challenge) return { ok: false, error: "invalid" };
  if (challenge.expiresAt < new Date()) return { ok: false, error: "expired" };
  if (challenge.attempts >= c.auth.otpMaxAttempts) return { ok: false, error: "locked" };

  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6 || !safeEqualHex(codeHash(th, clean), challenge.codeHash)) {
    await db
      .update(schema.otpChallenges)
      .set({ attempts: challenge.attempts + 1 })
      .where(eq(schema.otpChallenges.id, challenge.id));
    return { ok: false, error: challenge.attempts + 1 >= c.auth.otpMaxAttempts ? "locked" : "invalid" };
  }
  await db.update(schema.otpChallenges).set({ consumedAt: new Date() }).where(eq(schema.otpChallenges.id, challenge.id));

  // Proof of control established: find or create the account for this verified identifier.
  const col = channel === "email" ? schema.users.email : schema.users.phone;
  const [existing] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(col, target)).limit(1);
  const now = new Date();
  const role = channel === "email" && c.devEditorEmails.includes(target) ? ({ role: "editor" } as const) : {};
  if (existing) {
    await db
      .update(schema.users)
      .set(channel === "email" ? { emailVerifiedAt: now, ...role } : { phoneVerifiedAt: now })
      .where(eq(schema.users.id, existing.id));
    return { ok: true, userId: existing.id, created: false };
  }
  const derivedName =
    channel === "email"
      ? target.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Cultural Explorer";
  const [user] = await db
    .insert(schema.users)
    .values(
      channel === "email"
        ? { name: derivedName, email: target, emailVerifiedAt: now, ...role }
        : { name: derivedName, phone: target, phoneVerifiedAt: now },
    )
    .returning({ id: schema.users.id });
  return { ok: true, userId: user.id, created: true };
}
