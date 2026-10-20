import { NextResponse, type NextRequest } from "next/server";
import { currentSession, setSessionLanguage } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/normalize";
import { isLanguageCode } from "@/lib/i18n/languages";
import { track } from "@/lib/analytics";

/** Sets the session-scoped language (OD-14 default: not persisted beyond the session). */
export async function POST(request: NextRequest) {
  const s = await currentSession();
  if (!s) return NextResponse.redirect(new URL("/sign-in", request.url), 303);
  // Same-origin form posts only (defence in depth alongside SameSite cookies).
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const form = await request.formData();
  const lang = form.get("language");
  const next = safeNext(form.get("next"));
  if (!isLanguageCode(lang)) return NextResponse.redirect(new URL(`/language?next=${encodeURIComponent(next)}&error=1`, request.url), 303);
  await setSessionLanguage(s.sessionId, lang);
  await track("language_selected", { language: lang }, s.analyticsId);
  return NextResponse.redirect(new URL(next, request.url), 303);
}
