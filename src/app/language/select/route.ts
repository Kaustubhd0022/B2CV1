import { NextResponse, type NextRequest } from "next/server";
import { currentSession, setSessionLanguage, createSessionRecord, SESSION_COOKIE } from "@/lib/auth/session";
import { sha256 } from "@/lib/auth/crypto";
import { safeNext } from "@/lib/auth/normalize";
import { isLanguageCode } from "@/lib/i18n/languages";
import { track } from "@/lib/analytics";
import { getDb, schema } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { config } from "@/lib/config";

async function getOrCreateExplorerId(): Promise<string> {
  const db = await getDb();
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, "explorer@tattvaco.org"))
    .limit(1);
  if (existing) return existing.id;
  const [created] = await db
    .insert(schema.users)
    .values({ email: "explorer@tattvaco.org", role: "user" })
    .returning({ id: schema.users.id });
  return created.id;
}

/** Sets the session-scoped language. If unauthenticated, creates an explorer session to enter seamlessly. */
export async function POST(request: NextRequest) {
  const s = await currentSession();
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await request.formData();
  const lang = form.get("language");
  const rawNext = safeNext(form.get("next"));
  // Never redirect back to language page to prevent loops
  const next = (!rawNext || rawNext === "/language" || rawNext.startsWith("/language?") || rawNext.startsWith("/language/")) ? "/" : rawNext;

  if (!isLanguageCode(lang)) {
    return NextResponse.redirect(new URL(`/language?next=${encodeURIComponent(next)}&error=1`, request.url), 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);

  // Set the language cookie for client and SSR
  response.cookies.set("tc-language", lang, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
    httpOnly: false,
  });

  if (s) {
    await setSessionLanguage(s.sessionId, lang);
    await track("language_selected", { language: lang }, s.analyticsId);
  } else {
    // Provision explorer session so selecting a language immediately opens the app
    try {
      const userId = await getOrCreateExplorerId();
      const { token, expiresAt } = await createSessionRecord(userId);
      const db = await getDb();
      await db.update(schema.sessions).set({ language: lang }).where(eq(schema.sessions.tokenHash, sha256(token)));
      response.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: config().isProd,
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      });
    } catch (e) {
      console.error("Failed to provision session on language select:", e);
    }
  }

  return response;
}
