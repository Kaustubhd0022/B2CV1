import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { generateCodeVerifier, generateState } from "arctic";
import { config } from "@/lib/config";
import { appleClient, googleClient, oauthConfigured, type OAuthProvider } from "@/lib/auth/oauth";
import { safeNext } from "@/lib/auth/normalize";
import { track } from "@/lib/analytics";

export async function GET(request: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  if (provider !== "google" && provider !== "apple") return NextResponse.json({ error: "not_found" }, { status: 404 });
  const p = provider as OAuthProvider;
  if (!oauthConfigured(p)) return NextResponse.redirect(new URL(`/sign-in?error=${p}_not_configured`, request.url));

  const state = generateState();
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const jar = await cookies();
  // Apple returns via a cross-site POST (form_post), which only carries SameSite=None cookies.
  const base = {
    httpOnly: true,
    path: "/auth",
    maxAge: 600,
    secure: p === "apple" ? true : config().isProd,
    sameSite: p === "apple" ? ("none" as const) : ("lax" as const),
  };
  jar.set(`tc_oauth_state_${p}`, state, base);
  jar.set(`tc_oauth_next_${p}`, next, base);

  let url: URL;
  if (p === "google") {
    const verifier = generateCodeVerifier();
    jar.set("tc_oauth_verifier_google", verifier, base);
    url = googleClient().createAuthorizationURL(state, verifier, ["openid", "email", "profile"]);
  } else {
    url = appleClient().createAuthorizationURL(state, ["email"]);
    url.searchParams.set("response_mode", "form_post");
  }
  await track("auth_start", { method: p });
  return NextResponse.redirect(url);
}
