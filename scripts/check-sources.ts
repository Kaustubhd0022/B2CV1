/**
 * Checks every source URL and records link status (Design Screen 08: handle inaccessible
 * sources explicitly). Broken links are flagged in the UI; nothing is replaced automatically.
 * Usage: npm run sources:check
 */
import { eq, isNotNull } from "drizzle-orm";
import { closeDb, getDb, schema } from "@/lib/db/client";

const db = await getDb();
const rows = await db.select({ id: schema.sources.id, url: schema.sources.url }).from(schema.sources).where(isNotNull(schema.sources.url));
const UA = process.env.WIKIPEDIA_USER_AGENT || "TattvaCo/0.1 source-link-check";
let broken = 0;
for (const r of rows) {
  let status: "ok" | "broken" = "broken";
  try {
    const res = await fetch(r.url!, { method: "GET", redirect: "follow", headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15_000) });
    status = res.ok ? "ok" : res.status === 429 ? "ok" : "broken"; // rate-limited ≠ missing
    await res.body?.cancel();
  } catch {
    status = "broken";
  }
  if (status === "broken") broken++;
  await db.update(schema.sources).set({ linkStatus: status, linkCheckedAt: new Date() }).where(eq(schema.sources.id, r.id));
  console.log(`${status.padEnd(6)} ${r.id}`);
  await new Promise((res) => setTimeout(res, 300));
}
console.log(`\n${rows.length} checked, ${broken} broken.`);
await closeDb();
