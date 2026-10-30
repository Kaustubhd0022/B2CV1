"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { safeNext } from "@/lib/auth/normalize";
import { currentSession } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { recordNdaAcceptance } from "@/lib/legal/nda-record";

export async function acceptNda(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const session = await currentSession();
  if (!session) redirect("/sign-in");

  const h = await headers();
  const db = await getDb();
  const [user] = await db
    .select({ name: schema.users.name, email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);

  const recorded = await recordNdaAcceptance({
    name: user?.name ?? "",
    email: user?.email ?? session.email ?? "",
    userId: session.userId,
    language: session.language ?? undefined,
    ip: h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown",
    userAgent: h.get("user-agent") || "unknown",
  });
  if (!recorded) redirect(`/nda?error=1&next=${encodeURIComponent(next)}`);
  redirect(next);
}
