/**
 * Exports NDA acceptances as CSV for the legal team.
 * Usage: npm run -s legal:nda-export > nda-acceptances.csv
 */
import { existsSync } from "node:fs";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

const { asc } = await import("drizzle-orm");
const { closeDb, getDb, schema } = await import("@/lib/db/client");

const quote = (value: unknown) => {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  // A leading formula character would execute when the file is opened in a spreadsheet.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

const db = await getDb();
const rows = await db.select().from(schema.ndaAcceptances).orderBy(asc(schema.ndaAcceptances.agreedAt));
const columns = ["agreedAt", "name", "email", "userId", "version", "language", "ip", "userAgent"] as const;
console.log(columns.join(","));
for (const row of rows) console.log(columns.map((c) => quote(row[c])).join(","));
await closeDb();
