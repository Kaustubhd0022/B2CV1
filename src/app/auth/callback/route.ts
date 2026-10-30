import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { startSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/normalize";
import { resolveSupabaseAccount } from "@/lib/auth/supabase-account";

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
    const account = await resolveSupabaseAccount(user);
    if (!account.ok) {
      return NextResponse.redirect(new URL(`/sign-in?error=${account.error}`, request.url));
    }

    // Start application session
    await startSession(account.userId);
    const res = NextResponse.redirect(new URL(next || "/", request.url));
    res.cookies.delete("tc_pending");
    res.cookies.delete({ name: "tc_pending", path: "/sign-in" });
    res.cookies.delete({ name: "tc_pending", path: "/" });
    return res;
  }

  // Return to sign in if exchange failed
  return NextResponse.redirect(new URL(`/sign-in?error=verification_failed`, request.url));
}
