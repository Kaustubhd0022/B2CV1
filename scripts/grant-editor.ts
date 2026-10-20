import { eq } from "drizzle-orm";
import { closeDb, getDb, schema } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/auth/normalize";

// Usage: npm run editor:grant -- someone@example.org [--revoke]
const email = normalizeEmail(process.argv[2] ?? "");
if (!email) {
  console.error("Usage: npm run editor:grant -- <email> [--revoke]");
  process.exit(2);
}
const role = process.argv.includes("--revoke") ? "user" : "editor";
const db = await getDb();
const rows = await db.update(schema.users).set({ role }).where(eq(schema.users.email, email)).returning({ id: schema.users.id });
if (!rows.length) {
  console.error("No account with that email. The person must sign in once first.");
  process.exitCode = 1;
} else {
  await db.insert(schema.auditLog).values({
    actorLabel: "cli",
    action: role === "editor" ? "grant_editor" : "revoke_editor",
    targetType: "user",
    targetId: rows[0].id,
  });
  console.log(`Role for ${email} set to ${role}.`);
}
await closeDb();
