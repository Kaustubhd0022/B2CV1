import "server-only";
import { and, eq } from "drizzle-orm";
import { Apple, Google, decodeIdToken } from "arctic";
import { config } from "@/lib/config";
import { getDb, schema } from "@/lib/db/client";

export type OAuthProvider = "google" | "apple";

export function oauthConfigured(provider: OAuthProvider) {
  const a = config().auth;
  if (provider === "google") return !!a.google.clientId && !!a.google.clientSecret;
  return !!a.apple.clientId && !!a.apple.teamId && !!a.apple.keyId && !!a.apple.privateKey;
}

const redirectUri = (provider: OAuthProvider) => `${config().appUrl}/auth/${provider}/callback`;

export function googleClient() {
  const g = config().auth.google;
  return new Google(g.clientId!, g.clientSecret!, redirectUri("google"));
}

export function appleClient() {
  const a = config().auth.apple;
  const pem = a.privateKey!.replace(/\\n/g, "\n");
  const der = Buffer.from(pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "").replace(/\s/g, ""), "base64");
  return new Apple(a.clientId!, a.teamId!, a.keyId!, new Uint8Array(der), redirectUri("apple"));
}

export type IdentityClaims = { sub: string; email?: string; emailVerified: boolean; name?: string };

export function claimsFromIdToken(idToken: string): IdentityClaims {
  const c = decodeIdToken(idToken) as {
    sub?: string;
    email?: string;
    email_verified?: boolean | string;
    name?: string;
  };
  if (!c.sub) throw new Error("id_token without sub");
  return {
    sub: c.sub,
    email: c.email?.toLowerCase(),
    // Apple sends "true"/"false" strings; Google sends booleans.
    emailVerified: c.email_verified === true || c.email_verified === "true",
    name: c.name,
  };
}

export type ResolveResult = { ok: true; userId: string; created: boolean } | { ok: false; error: "link_conflict" };

/**
 * Account resolution with safe linking (FR-02):
 * 1. Known provider identity → that account.
 * 2. Provider asserts a *verified* email that matches an account → link (the provider proved control).
 * 3. Unverified email matching an existing account → refuse; never create a silent duplicate.
 * 4. Otherwise create a new account in Supabase Postgres.
 */
export async function resolveOAuthUser(provider: OAuthProvider, claims: IdentityClaims): Promise<ResolveResult> {
  const db = await getDb();
  const [identity] = await db
    .select({ userId: schema.authIdentities.userId })
    .from(schema.authIdentities)
    .where(and(eq(schema.authIdentities.provider, provider), eq(schema.authIdentities.providerUserId, claims.sub)))
    .limit(1);
  if (identity) return { ok: true, userId: identity.userId, created: false };

  if (claims.email) {
    const [byEmail] = await db
      .select({ id: schema.users.id, name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.email, claims.email))
      .limit(1);
    if (byEmail) {
      if (!claims.emailVerified) return { ok: false, error: "link_conflict" };
      await db.insert(schema.authIdentities).values({ userId: byEmail.id, provider, providerUserId: claims.sub });
      if (claims.name && !byEmail.name) {
        await db.update(schema.users).set({ name: claims.name }).where(eq(schema.users.id, byEmail.id));
      }
      return { ok: true, userId: byEmail.id, created: false };
    }
  }

  const derivedName = claims.name || (claims.email ? claims.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Cultural Explorer");
  const [user] = await db
    .insert(schema.users)
    .values({
      name: derivedName,
      email: claims.email && claims.emailVerified ? claims.email : undefined,
      emailVerifiedAt: claims.email && claims.emailVerified ? new Date() : undefined,
    })
    .returning({ id: schema.users.id });
  await db.insert(schema.authIdentities).values({ userId: user.id, provider, providerUserId: claims.sub });
  return { ok: true, userId: user.id, created: true };
}
