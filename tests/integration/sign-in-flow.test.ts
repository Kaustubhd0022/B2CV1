import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq, sql } from "drizzle-orm";
import { closeDb, getDb, schema } from "@/lib/db/client";
import { resetConfigForTests } from "@/lib/config";

const { jar, requestHeaders, supabaseAuth } = vi.hoisted(() => ({
  jar: new Map<string, string>(),
  requestHeaders: new Headers(),
  supabaseAuth: {
    signInWithOtp: vi.fn(),
    verifyOtp: vi.fn(),
    signUp: vi.fn(),
    getUser: vi.fn(async () => ({ data: { user: null } })),
  },
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (arg: string | { name: string }) => void jar.delete(typeof arg === "string" ? arg : arg.name),
  }),
  headers: async () => requestHeaders,
}));
vi.mock("next/navigation", () => ({
  redirect: (location: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { location });
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: supabaseAuth }) }));

import { createAccount, startEmail, verifyCode } from "@/app/sign-in/actions";
import { acceptNda } from "@/app/nda/actions";
import { createSignedToken, requireUser, startSession, verifySignedToken } from "@/lib/auth/session";
import { hasAcceptedNda } from "@/lib/legal/nda-record";

async function redirectOf(action: Promise<unknown>) {
  const err = await action.then(
    () => {
      throw new Error("expected a redirect");
    },
    (e) => e as { location?: string },
  );
  expect(err.location).toBeDefined();
  return err.location!;
}

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const unique = (label: string) => `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.org`;
const signUpFields = (email: string) => ({ email, password: "correct-horse", nda_agreed: "true", next: "/explore" });

beforeAll(async () => {
  await getDb();
});
afterAll(closeDb);
beforeEach(() => {
  jar.clear();
  vi.clearAllMocks();
  supabaseAuth.getUser.mockResolvedValue({ data: { user: null } });
  vi.stubEnv("EMAIL_PROVIDER", "supabase");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
  resetConfigForTests();
});
afterEach(() => {
  vi.unstubAllEnvs();
  resetConfigForTests();
});

describe("code sign-in through Supabase", () => {
  it("sends the code, verifies it, creates one account and starts a session", async () => {
    const email = unique("otp");
    const id = crypto.randomUUID();
    supabaseAuth.signInWithOtp.mockResolvedValue({ error: null });
    supabaseAuth.verifyOtp.mockResolvedValue({
      data: { user: { id, email, email_confirmed_at: new Date().toISOString(), user_metadata: {} } },
      error: null,
    });

    expect(await redirectOf(startEmail(form({ email, next: "/explore" })))).toBe("/sign-in/verify");
    expect(supabaseAuth.signInWithOtp).toHaveBeenCalledOnce();
    expect(jar.has("tc_pending")).toBe(true);

    expect(await redirectOf(verifyCode(form({ code: "123456" })))).toBe("/language?next=%2Fexplore");
    expect(jar.has("tc_session")).toBe(true);
    expect(jar.has("tc_pending")).toBe(false);
    const db = await getDb();
    expect(await db.select().from(schema.users).where(eq(schema.users.email, email))).toHaveLength(1);
  });

  it("rejects a wrong code without starting a session", async () => {
    supabaseAuth.signInWithOtp.mockResolvedValue({ error: null });
    supabaseAuth.verifyOtp.mockResolvedValue({ data: { user: null }, error: { message: "Token has expired or is invalid" } });

    await redirectOf(startEmail(form({ email: unique("wrong"), next: "/" })));

    expect(await redirectOf(verifyCode(form({ code: "000000" })))).toBe("/sign-in/verify?error=invalid");
    expect(jar.has("tc_session")).toBe(false);
  });

  it("explains a send limit instead of claiming a code was sent", async () => {
    supabaseAuth.signInWithOtp.mockResolvedValue({ error: { code: "over_email_send_rate_limit", message: "limit" } });

    const location = await redirectOf(startEmail(form({ email: unique("limit"), next: "/" })));

    expect(location).toContain("error=too_many");
    expect(jar.has("tc_pending")).toBe(false);
  });
});

describe("sign-up through Supabase", () => {
  it("records the NDA and waits for the emailed code", async () => {
    const email = unique("signup");
    const id = crypto.randomUUID();
    supabaseAuth.signUp.mockResolvedValue({ data: { user: { id, email, identities: [{}] }, session: null }, error: null });

    expect(await redirectOf(createAccount(form(signUpFields(email))))).toBe("/sign-in/verify?signup=1");
    expect(await hasAcceptedNda(id)).toBe(true);
    expect(jar.has("tc_session")).toBe(false);
  });

  it("reports an existing email instead of waiting for a code that is never sent", async () => {
    const email = unique("hidden");
    const id = crypto.randomUUID();
    supabaseAuth.signUp.mockResolvedValue({ data: { user: { id, email, identities: [] }, session: null }, error: null });

    expect(await redirectOf(createAccount(form(signUpFields(email))))).toContain("error=email_exists");
    expect(await hasAcceptedNda(id)).toBe(false);
  });

  it.each([
    ["rejects the send", async () => ({ data: { user: null, session: null }, error: { message: "Email address not authorized" } })],
    ["throws", async () => { throw new Error("network"); }],
  ])("never creates an unverified account when Supabase %s", async (_label, signUp) => {
    const email = unique("failed");
    supabaseAuth.signUp.mockImplementation(signUp);

    expect(await redirectOf(createAccount(form(signUpFields(email))))).toContain("error=delivery");
    const db = await getDb();
    expect(await db.select().from(schema.users).where(eq(schema.users.email, email))).toHaveLength(0);
    expect(jar.has("tc_session")).toBe(false);
  });
});

describe("NDA gate", () => {
  async function signedIn(path: string) {
    const db = await getDb();
    const [user] = await db.insert(schema.users).values({ name: "Gate", email: unique("gate") }).returning({ id: schema.users.id });
    jar.set("tc_session", createSignedToken(user.id));
    requestHeaders.set("x-tc-path", path);
    return user.id;
  }

  it("sends signed-in users to the NDA until they accept, then lets them through", async () => {
    const userId = await signedIn("/explore?x=1");

    expect(await redirectOf(requireUser())).toBe("/nda?next=%2Fexplore%3Fx%3D1");

    requestHeaders.set("x-forwarded-for", "203.0.113.9, 10.0.0.1");
    requestHeaders.set("user-agent", "vitest");
    expect(await redirectOf(acceptNda(form({ next: "/explore?x=1" })))).toBe("/explore?x=1");

    expect((await requireUser()).userId).toBe(userId);
    const db = await getDb();
    const [row] = await db.select().from(schema.ndaAcceptances).where(eq(schema.ndaAcceptances.userId, userId));
    expect(row).toMatchObject({ ip: "203.0.113.9", userAgent: "vitest", name: "Gate" });
  });
});

describe("session role", () => {
  it("gives an editor account the editor role at sign-in", async () => {
    const db = await getDb();
    const [editor] = await db
      .insert(schema.users)
      .values({ name: "Editor", email: unique("editor"), role: "editor" })
      .returning({ id: schema.users.id });

    await startSession(editor.id);

    expect(verifySignedToken(jar.get("tc_session")!)?.role).toBe("editor");
  });
});

describe("database exposure", () => {
  it("has row level security on every public table", async () => {
    const db = await getDb();
    const result = await db.execute(sql`select tablename from pg_tables where schemaname = 'public' and not rowsecurity`);
    const rows = (result as unknown as { rows: { tablename: string }[] }).rows;
    expect(rows.map((r) => r.tablename)).toEqual([]);
  });
});
