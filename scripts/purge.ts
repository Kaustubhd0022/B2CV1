/**
 * Retention maintenance. Periods are PROVISIONAL (OD-05) and come from RETENTION_* env vars.
 * Dry-run by default; pass --apply to delete. Never touches editorial content or audit logs.
 * Usage: npm run maintenance:purge [-- --apply]
 */
import { and, inArray, lt, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { config } from "@/lib/config";
import { closeDb, getDb, schema } from "@/lib/db/client";

const apply = process.argv.includes("--apply");
const r = config().retention;
const db = await getDb();
const ago = (days: number) => new Date(Date.now() - days * 86_400_000);
const count = async (table: PgTable, where: SQL | undefined) =>
  (await db.select({ n: sql<number>`count(*)::int` }).from(table).where(where))[0].n;

const plan = [
  { name: "expired sessions (incl. session AI context)", table: schema.sessions, where: lt(schema.sessions.expiresAt, new Date()) },
  { name: "used/expired OTP challenges older than 1 day", table: schema.otpChallenges, where: lt(schema.otpChallenges.createdAt, ago(1)) },
  { name: `answer check records older than ${r.answerRunDays}d`, table: schema.answerRuns, where: lt(schema.answerRuns.createdAt, ago(r.answerRunDays)) },
  { name: `analytics events older than ${r.analyticsDays}d`, table: schema.analyticsEvents, where: lt(schema.analyticsEvents.createdAt, ago(r.analyticsDays)) },
  {
    name: `resolved/dismissed reports older than ${r.resolvedReportDays}d`,
    table: schema.reports,
    where: and(inArray(schema.reports.status, ["resolved", "dismissed"]), lt(schema.reports.updatedAt, ago(r.resolvedReportDays))),
  },
];
for (const p of plan) {
  const n = await count(p.table, p.where);
  if (apply && n) await db.delete(p.table).where(p.where);
  console.log(`${apply ? "deleted" : "would delete"} ${n} — ${p.name}`);
}
if (!apply) console.log("\nDry run. Re-run with --apply once retention periods are approved.");
await closeDb();
