import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { config } from "@/lib/config";
import { getDb, schema } from "@/lib/db/client";
import { hmac, safeEqualHex } from "@/lib/auth/crypto";
import { startSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/normalize";
import { track } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const cid = url.searchParams.get("cid");
  const token = url.searchParams.get("token");
  const channel = (url.searchParams.get("channel") || "email") as "email" | "phone";
  const target = url.searchParams.get("target") || "";
  const next = safeNext(url.searchParams.get("next"));

  if (!cid || !token || !target) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid_link", request.url));
  }

  const c = config();
  const th = hmac(c.auth.secret, `${channel}:${target}`);
  const expectedToken = hmac(c.auth.secret, `${cid}:${th}`);

  if (!safeEqualHex(token, expectedToken)) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid_link", request.url));
  }

  const db = await getDb();
  const [challenge] = await db
    .select()
    .from(schema.otpChallenges)
    .where(and(eq(schema.otpChallenges.id, cid), eq(schema.otpChallenges.targetHash, th)))
    .limit(1);

  if (!challenge) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid_link", request.url));
  }

  if (challenge.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/sign-in/verify?error=expired", request.url));
  }

  // Mark this specific challenge consumed.
  // This notifies both the mobile browser AND the laptop tab polling checkVerificationStatus!
  const now = new Date();
  await db
    .update(schema.otpChallenges)
    .set({ consumedAt: now })
    .where(eq(schema.otpChallenges.id, challenge.id));

  // Find or create user
  const col = channel === "email" ? schema.users.email : schema.users.phone;
  let [user] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(col, target)).limit(1);
  const role = channel === "email" && c.devEditorEmails.includes(target) ? ({ role: "editor" } as const) : {};

  let created = false;
  if (user) {
    await db
      .update(schema.users)
      .set(channel === "email" ? { emailVerifiedAt: now, ...role } : { phoneVerifiedAt: now })
      .where(eq(schema.users.id, user.id));
  } else {
    const derivedName =
      channel === "email"
        ? target.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Cultural Explorer";
    const [newUser] = await db
      .insert(schema.users)
      .values(
        channel === "email"
          ? { name: derivedName, email: target, emailVerifiedAt: now, ...role }
          : { name: derivedName, phone: target, phoneVerifiedAt: now },
      )
      .returning({ id: schema.users.id });
    user = newUser;
    created = true;
  }

  // Authenticate the device that tapped the link (e.g. mobile phone)
  await startSession(user.id);
  await track("auth_success", { method: `${channel}_link_confirmed`, new_account: created });

  const res = NextResponse.redirect(new URL(next || "/", request.url));
  res.cookies.delete("tc_pending");
  res.cookies.delete({ name: "tc_pending", path: "/sign-in" });
  res.cookies.delete({ name: "tc_pending", path: "/" });
  return res;
}
