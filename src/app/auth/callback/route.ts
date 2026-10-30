import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { startSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/normalize";
import { getDb, schema } from "@/lib/db/client";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(requestUrl.searchParams.get("next"));

  const supabase = await createClient();
  let user = null;

  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error && data.user) {
      user = data.user;
    }
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      user = data.user;
    }
  }

  if (user) {
    const db = await getDb();
    // Ensure user row in public.users is present and marked verified
    const [existing] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    if (!existing && user.email) {
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      await db.insert(schema.users).values({
        id: user.id,
        name,
        email: user.email,
        emailVerifiedAt: new Date(),
      });
    } else if (existing) {
      await db
        .update(schema.users)
        .set({ emailVerifiedAt: new Date() })
        .where(eq(schema.users.id, user.id));
    }

    // Start application session
    await startSession(user.id);
    return NextResponse.redirect(new URL(next || "/", request.url));
  }

  // Return to sign in if exchange failed
  return NextResponse.redirect(new URL(`/sign-in?error=verification_failed`, request.url));
}
