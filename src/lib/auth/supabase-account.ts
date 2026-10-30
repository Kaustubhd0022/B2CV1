import "server-only";
import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";

export type SupabaseAccountResult = { ok: true; userId: string; created: boolean } | { ok: false; error: "link_conflict" };

/**
 * Maps a verified Supabase Auth user to its row in public.users, following the same linking
 * rule as OAuth (FR-02): an email held by an account under another id links only when confirmed.
 */
export async function resolveSupabaseAccount(user: User): Promise<SupabaseAccountResult> {
  const db = await getDb();
  const now = new Date();
  const [existing] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.id, user.id)).limit(1);
  if (existing) {
    await db.update(schema.users).set({ emailVerifiedAt: now }).where(eq(schema.users.id, existing.id));
    return { ok: true, userId: existing.id, created: false };
  }
  if (!user.email) return { ok: true, userId: user.id, created: false };

  const [byEmail] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, user.email)).limit(1);
  if (byEmail) {
    if (!user.email_confirmed_at) return { ok: false, error: "link_conflict" };
    await db.update(schema.users).set({ emailVerifiedAt: now }).where(eq(schema.users.id, byEmail.id));
    return { ok: true, userId: byEmail.id, created: false };
  }

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  await db.insert(schema.users).values({ id: user.id, name, email: user.email, emailVerifiedAt: now });
  return { ok: true, userId: user.id, created: true };
}
