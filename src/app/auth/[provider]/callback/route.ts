import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { appleClient, claimsFromIdToken, googleClient, oauthConfigured, resolveOAuthUser, type OAuthProvider } from "@/lib/auth/oauth";
import { currentSession, endSession, startSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/normalize";
import { track } from "@/lib/analytics";
import { log } from "@/lib/log";

async function handle(request: NextRequest, provider: string, params: URLSearchParams) {
  if (provider !== "google" && provider !== "apple") return NextResponse.json({ error: "not_found" }, { status: 404 });
  const p = provider as OAuthProvider;
  const fail = async (reason: string) => {
    await track("auth_failure", { method: p, reason });
    return NextResponse.redirect(new URL(`/sign-in?error=${reason === "link_conflict" ? "link_conflict" : "oauth_failed"}`, request.url), 303);
  };
  if (!oauthConfigured(p)) return fail("not_configured");

  const jar = await cookies();
  const expected = jar.get(`tc_oauth_state_${p}`)?.value;
  const next = safeNext(jar.get(`tc_oauth_next_${p}`)?.value);
  const verifier = jar.get("tc_oauth_verifier_google")?.value;
  for (const name of [`tc_oauth_state_${p}`, `tc_oauth_next_${p}`, "tc_oauth_verifier_google"]) jar.delete({ name, path: "/auth" });

  const code = params.get("code");
  const state = params.get("state");
  if (params.get("error")) return fail("provider_error");
  if (!code || !state || !expected || state !== expected) return fail("state_mismatch");

  try {
    // The ID token comes directly from the provider's token endpoint over TLS in exchange
    // for a one-time code bound to our client credentials (and PKCE for Google).
    const tokens = p === "google" ? await googleClient().validateAuthorizationCode(code, verifier ?? "") : await appleClient().validateAuthorizationCode(code);
    const claims = claimsFromIdToken(tokens.idToken());
    const r = await resolveOAuthUser(p, claims);
    if (!r.ok) return fail(r.error);
    if (await currentSession()) await endSession();
    await startSession(r.userId);
    await track("auth_success", { method: p, new_account: r.created });
    return NextResponse.redirect(new URL(r.created ? `/language?next=${encodeURIComponent(next)}` : (next || "/"), request.url), 303);
  } catch (err) {
    log.warn("oauth.callback_failed", { provider: p, error: (err as Error).name });
    return fail("exchange_failed");
  }
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  return handle(request, (await ctx.params).provider, request.nextUrl.searchParams);
}

/** Apple posts the authorization response (response_mode=form_post). */
export async function POST(request: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const form = await request.formData();
  const params = new URLSearchParams();
  for (const k of ["code", "state", "error"]) {
    const v = form.get(k);
    if (typeof v === "string") params.set(k, v);
  }
  return handle(request, (await ctx.params).provider, params);
}
