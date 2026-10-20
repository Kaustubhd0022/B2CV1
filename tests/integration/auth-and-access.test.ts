import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { closeDb, getDb, schema } from "@/lib/db/client";
import { startChallenge, verifyChallenge } from "@/lib/auth/otp";
import { DEV_OUTBOX } from "@/lib/auth/delivery";
import { createSessionRecord, deleteSessionByToken, findSessionByToken, setSessionLanguage } from "@/lib/auth/session";
import { resolveOAuthUser } from "@/lib/auth/oauth";
import { createReport, ReportInputSchema } from "@/lib/reports";
import { rateLimit, resetRateLimits } from "@/lib/ratelimit";
import { ingestContent } from "@/lib/content/ingest";
import { cityStories, getStory, featuredConnection } from "@/lib/content/repo";
import { resetConfigForTests } from "@/lib/config";

function lastCode(to: string) {
  const lines = readFileSync(DEV_OUTBOX, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  return lines.filter((l) => l.to === to).at(-1).code as string;
}

beforeAll(async () => {
  await getDb();
});
afterAll(closeDb);

describe("email/phone one-time codes", () => {
  it("verifies a correct code, creates exactly one account, and reuses it on next sign-in", async () => {
    const email = `otp-${Date.now()}@example.org`;
    expect(await startChallenge("email", email)).toEqual({ ok: true });
    const first = await verifyChallenge("email", email, lastCode(email));
    expect(first).toMatchObject({ ok: true, created: true });

    await startChallenge("email", email);
    const second = await verifyChallenge("email", email, lastCode(email));
    expect(second).toMatchObject({ ok: true, created: false });
    if (first.ok && second.ok) expect(second.userId).toBe(first.userId);

    const db = await getDb();
    expect(await db.select().from(schema.users).where(eq(schema.users.email, email))).toHaveLength(1);
  });

  it("rejects wrong codes and locks after the maximum attempts", async () => {
    const phone = `+91${Date.now().toString().slice(-10)}`;
    await startChallenge("phone", phone);
    const good = lastCode(phone);
    const bad = good === "000000" ? "111111" : "000000";
    for (let i = 0; i < 4; i++) expect(await verifyChallenge("phone", phone, bad)).toEqual({ ok: false, error: "invalid" });
    expect(await verifyChallenge("phone", phone, bad)).toEqual({ ok: false, error: "locked" });
    expect(await verifyChallenge("phone", phone, good)).toEqual({ ok: false, error: "locked" });
  });

  it("rejects expired codes and codes that were superseded by a newer one", async () => {
    const email = `exp-${Date.now()}@example.org`;
    await startChallenge("email", email);
    const old = lastCode(email);
    await startChallenge("email", email);
    expect((await verifyChallenge("email", email, old)).ok).toBe(lastCode(email) === old);
    const db = await getDb();
    await db.update(schema.otpChallenges).set({ expiresAt: new Date(Date.now() - 1000) });
    expect(await verifyChallenge("email", email, lastCode(email))).toEqual({ ok: false, error: "expired" });
  });

  it("rate-limits code requests per identifier", async () => {
    const email = `rl-${Date.now()}@example.org`;
    for (let i = 0; i < 5; i++) expect((await startChallenge("email", email)).ok).toBe(true);
    expect(await startChallenge("email", email)).toEqual({ ok: false, error: "rate_limited" });
  });

  it("never stores the raw code or identifier in the challenge table", async () => {
    const email = `raw-${Date.now()}@example.org`;
    await startChallenge("email", email);
    const db = await getDb();
    const rows = await db.select().from(schema.otpChallenges);
    const dump = JSON.stringify(rows);
    expect(dump).not.toContain(email);
    expect(dump).not.toContain(`"${lastCode(email)}"`);
  });
});

describe("sessions", () => {
  it("creates, resolves, scopes language to the session and ends sessions; expired sessions are invalid", async () => {
    const db = await getDb();
    const [u] = await db.insert(schema.users).values({ email: `s-${Date.now()}@example.org` }).returning();
    const { token } = await createSessionRecord(u.id);
    const s = await findSessionByToken(token);
    expect(s?.userId).toBe(u.id);
    expect(s?.language).toBeNull();
    await setSessionLanguage(s!.sessionId, "ta");
    expect((await findSessionByToken(token))?.language).toBe("ta");

    // A new session does not inherit language or AI context from the previous one.
    const second = await createSessionRecord(u.id);
    const s2 = await findSessionByToken(second.token);
    expect(s2?.language).toBeNull();
    const [row] = await db.select().from(schema.sessions).where(eq(schema.sessions.id, s2!.sessionId));
    expect(row.askContext).toEqual([]);

    await deleteSessionByToken(token);
    expect(await findSessionByToken(token)).toBeNull();
    await db.update(schema.sessions).set({ expiresAt: new Date(Date.now() - 1) }).where(eq(schema.sessions.id, s2!.sessionId));
    expect(await findSessionByToken(second.token)).toBeNull();
  });

  it("stores only a hash of the session token", async () => {
    const db = await getDb();
    const [u] = await db.insert(schema.users).values({ email: `h-${Date.now()}@example.org` }).returning();
    const { token } = await createSessionRecord(u.id);
    const rows = await db.select().from(schema.sessions);
    expect(JSON.stringify(rows)).not.toContain(token);
  });
});

describe("OAuth account linking (no silent duplicates)", () => {
  it("links a verified provider email to the existing account, refuses an unverified one", async () => {
    const db = await getDb();
    const email = `link-${Date.now()}@example.org`;
    const [u] = await db.insert(schema.users).values({ email, emailVerifiedAt: new Date() }).returning();

    expect(await resolveOAuthUser("google", { sub: "g-unverified", email, emailVerified: false })).toEqual({ ok: false, error: "link_conflict" });
    const linked = await resolveOAuthUser("google", { sub: "g-1", email, emailVerified: true });
    expect(linked).toEqual({ ok: true, userId: u.id });
    // Same provider identity later → same account, even if the email changed at the provider.
    expect(await resolveOAuthUser("google", { sub: "g-1", email: "changed@example.org", emailVerified: true })).toEqual({ ok: true, userId: u.id });

    const fresh = await resolveOAuthUser("apple", { sub: "a-1", emailVerified: false });
    expect(fresh.ok).toBe(true);
    if (fresh.ok) expect(fresh.userId).not.toBe(u.id);
  });
});

describe("reports", () => {
  it("validates input and only stores an answer snapshot for answer reports", async () => {
    expect(ReportInputSchema.safeParse({ targetType: "story", targetRef: "x", category: "made_up", language: "en" }).success).toBe(false);
    expect(ReportInputSchema.safeParse({ targetType: "story", targetRef: "../etc", category: "other", language: "en" }).success).toBe(false);
    expect(ReportInputSchema.safeParse({ targetType: "story", targetRef: "x", category: "other", language: "xx" }).success).toBe(false);
    const snapshot = { question: "q", answer: "a", sources: [], outcome: "qualified" };
    const id = await createReport(ReportInputSchema.parse({ targetType: "story", targetRef: "x", category: "other", language: "en", snapshot }));
    const db = await getDb();
    const [row] = await db.select().from(schema.reports).where(eq(schema.reports.id, id));
    expect(row.snapshot).toBeNull();
    expect(row.status).toBe("new");
  });
});

describe("rate limiter", () => {
  it("allows up to the limit within the window", () => {
    resetRateLimits();
    const t = 1_000_000;
    expect(rateLimit("k", 2, 1000, t).ok).toBe(true);
    expect(rateLimit("k", 2, 1000, t + 1).ok).toBe(true);
    expect(rateLimit("k", 2, 1000, t + 2).ok).toBe(false);
    expect(rateLimit("k", 2, 1000, t + 1001).ok).toBe(true);
  });
});

describe("public content visibility", () => {
  it("shows nothing before publication, fixtures only when allowed, and never silently switches language", async () => {
    await ingestContent();
    expect(await cityStories("jaipur", "en")).toEqual([]);
    expect((await getStory("jaipur-jantar-mantar", "en")).status).toBe("unavailable");

    // Simulate a published fixture (the workflow itself is covered in content.test.ts).
    const db = await getDb();
    const [v] = await db
      .select({ id: schema.contentVersions.id })
      .from(schema.contentVersions)
      .innerJoin(schema.contentItems, eq(schema.contentItems.id, schema.contentVersions.itemId))
      .where(eq(schema.contentItems.slug, "jaipur-jantar-mantar"));
    await db.update(schema.contentVersions).set({ status: "published" }).where(eq(schema.contentVersions.id, v.id));

    expect((await cityStories("jaipur", "en")).map((s) => s.slug)).toEqual(["jaipur-jantar-mantar"]);
    expect(await cityStories("jaipur", "hi")).toEqual([]);
    expect((await cityStories("jaipur", "hi", true))[0].language).toBe("en");
    expect(await getStory("jaipur-jantar-mantar", "hi")).toEqual({ status: "other_languages", available: ["en"] });

    process.env.ALLOW_FIXTURE_CONTENT = "false";
    resetConfigForTests();
    expect(await cityStories("jaipur", "en")).toEqual([]);
    expect((await getStory("jaipur-jantar-mantar", "en")).status).toBe("unavailable");
    expect(await featuredConnection("en")).toBeNull();
    delete process.env.ALLOW_FIXTURE_CONTENT;
    resetConfigForTests();
  });
});

describe("demo mode (on-screen codes)", () => {
  it("returns the code for on-screen display instead of sending it, and still verifies it", async () => {
    process.env.EMAIL_PROVIDER = "screen";
    resetConfigForTests();
    const email = `demo-${Date.now()}@example.org`;
    const r = await startChallenge("email", email);
    expect(r.ok).toBe(true);
    const code = r.ok ? r.demoCode : undefined;
    expect(code).toMatch(/^\d{6}$/);
    expect(await verifyChallenge("email", email, code!)).toMatchObject({ ok: true });
    delete process.env.EMAIL_PROVIDER;
    resetConfigForTests();
  });

  it("refuses on-screen codes in production unless DEMO_MODE is explicitly on", async () => {
    const { assertProductionSafety, config } = await import("@/lib/config");
    const base = { NODE_ENV: "production", DATABASE_URL: "postgres://x", AUTH_SECRET: "x".repeat(40), EMAIL_PROVIDER: "screen", SMS_PROVIDER: "twilio", LLM_PROVIDER: "none" };
    const saved = { ...process.env };
    Object.assign(process.env, base);
    resetConfigForTests();
    expect(() => assertProductionSafety(config())).toThrow(/DEMO_MODE/);
    process.env.DEMO_MODE = "true";
    resetConfigForTests();
    expect(() => assertProductionSafety(config())).not.toThrow();
    process.env = saved;
    resetConfigForTests();
  });
});
