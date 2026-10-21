import { NextResponse, type NextRequest } from "next/server";
import { currentSession, createSignedToken, SESSION_COOKIE } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/normalize";
import { isLanguageCode } from "@/lib/i18n/languages";
import { track } from "@/lib/analytics";
import { config } from "@/lib/config";

/** Sets the session-scoped language and provisions an authenticated session so the user directly enters the app. */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await request.formData();
  const lang = form.get("language");
  const rawNext = safeNext(form.get("next"));
  // Never redirect back to language page or sign-in to prevent loops
  const next = (!rawNext || rawNext === "/language" || rawNext.startsWith("/language?") || rawNext.startsWith("/language/") || rawNext === "/sign-in") ? "/" : rawNext;

  if (!isLanguageCode(lang)) {
    return NextResponse.redirect(new URL(`/language?next=${encodeURIComponent(next)}&error=1`, request.url), 303);
  }

  const s = await currentSession();
  const userId = s?.userId || "explorer";
  const role = s?.role || "user";

  const response = NextResponse.redirect(new URL(next, request.url), 303);

  // Set the language preference cookie (1 year)
  response.cookies.set("tc-language", lang, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
    httpOnly: false,
  });

  // Create an HMAC-signed session token with the chosen language
  const signedToken = createSignedToken(userId, role, lang, config().auth.sessionDays);
  const expiresAt = new Date(Date.now() + config().auth.sessionDays * 86_400_000);

  // Set the authenticated session cookie directly on the HTTP redirect response
  response.cookies.set(SESSION_COOKIE, signedToken, {
    httpOnly: true,
    secure: config().isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  if (s) {
    track("language_selected", { language: lang }, s.analyticsId).catch(() => {});
  }

  return response;
}
