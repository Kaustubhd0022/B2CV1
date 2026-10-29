import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { startSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/normalize";
import { getDb, schema } from "@/lib/db/client";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const db = await getDb();
      // Ensure user row in public.users is present
      const [existing] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.id, data.user.id))
        .limit(1);

      if (!existing && data.user.email) {
        const name =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        await db.insert(schema.users).values({
          id: data.user.id,
          name,
          email: data.user.email,
          emailVerifiedAt: new Date(),
        });
      }

      // Start application session
      await startSession(data.user.id);
      return NextResponse.redirect(new URL(next || "/", request.url));
    }
  }

  // Return to sign in if exchange failed
  return NextResponse.redirect(new URL(`/sign-in?error=oauth_failed`, request.url));
}
