import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { closeDb, getDb, schema } from "@/lib/db/client";
import { sendEmailCode } from "@/lib/auth/delivery";
import { config, resetConfigForTests } from "@/lib/config";

const { exchangeCodeForSession, signInWithOtp, startSession } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  signInWithOtp: vi.fn(),
  startSession: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession, signInWithOtp } }),
}));
vi.mock("@/lib/auth/session", () => ({ startSession }));

import { GET } from "@/app/auth/callback/route";

function callback() {
  return GET(new NextRequest("https://tattvaco.test/auth/callback?code=abc&next=%2Fexplore"));
}

beforeAll(async () => {
  await getDb();
});
afterAll(closeDb);
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  resetConfigForTests();
});

describe("Supabase callback account resolution", () => {
  it("signs in to the existing account when the verified email already belongs to another id", async () => {
    const db = await getDb();
    const email = `callback-${Date.now()}@example.org`;
    const [local] = await db.insert(schema.users).values({ name: "Local", email }).returning({ id: schema.users.id });
    const supabaseId = crypto.randomUUID();
    exchangeCodeForSession.mockResolvedValue({
      data: { user: { id: supabaseId, email, email_confirmed_at: new Date().toISOString(), user_metadata: {} } },
      error: null,
    });

    const res = await callback();

    expect(res.headers.get("location")).toBe("https://tattvaco.test/explore");
    expect(startSession).toHaveBeenCalledWith(local.id);
    const rows = await db.select().from(schema.users).where(eq(schema.users.email, email));
    expect(rows).toHaveLength(1);
    expect(rows[0].emailVerifiedAt).not.toBeNull();
  });

  it("refuses to link an unconfirmed email to an existing account", async () => {
    const db = await getDb();
    const email = `callback-unconfirmed-${Date.now()}@example.org`;
    await db.insert(schema.users).values({ name: "Local", email });
    exchangeCodeForSession.mockResolvedValue({
      data: { user: { id: crypto.randomUUID(), email, email_confirmed_at: null, user_metadata: {} } },
      error: null,
    });

    const res = await callback();

    expect(res.headers.get("location")).toBe("https://tattvaco.test/sign-in?error=link_conflict");
    expect(startSession).not.toHaveBeenCalled();
  });
});

describe("email delivery through Supabase", () => {
  function useSupabase(provider = "supabase") {
    vi.stubEnv("EMAIL_PROVIDER", provider);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    resetConfigForTests();
  }

  it.each(["supabase", "resend"])("sends through Supabase only when EMAIL_PROVIDER=%s", async (provider) => {
    useSupabase(provider);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    signInWithOtp.mockResolvedValue({ error: null });

    expect(await sendEmailCode("someone@example.org", "123456")).toEqual({ ok: true });
    expect(signInWithOtp).toHaveBeenCalledOnce();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports a provider error instead of pretending the code was sent", async () => {
    useSupabase();
    signInWithOtp.mockResolvedValue({ error: { code: "email_address_not_authorized", message: "Email address not authorized" } });

    expect(await sendEmailCode("someone@example.org", "123456")).toEqual({ ok: false, reason: "provider_error" });
  });

  it("reports Supabase's send limit as rate limiting", async () => {
    useSupabase();
    signInWithOtp.mockResolvedValue({ error: { code: "over_email_send_rate_limit", message: "rate limit" } });

    expect(await sendEmailCode("someone@example.org", "123456")).toEqual({ ok: false, reason: "rate_limited" });
  });

  it("is not configured without a Supabase key", async () => {
    vi.stubEnv("EMAIL_PROVIDER", "supabase");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    resetConfigForTests();

    expect(await sendEmailCode("someone@example.org", "123456")).toEqual({ ok: false, reason: "not_configured" });
  });
});

describe("public app URL on Vercel", () => {
  it("uses the stable production domain, not the per-deployment hash domain", () => {
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_URL", "app-abc123-team.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "app.vercel.app");
    resetConfigForTests();
    expect(config().appUrl).toBe("https://app.vercel.app");
  });

  it("keeps preview deployments on their own domain so PKCE cookies stay on the same host", () => {
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "app-abc123-team.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "app.vercel.app");
    resetConfigForTests();
    expect(config().appUrl).toBe("https://app-abc123-team.vercel.app");
  });
});
