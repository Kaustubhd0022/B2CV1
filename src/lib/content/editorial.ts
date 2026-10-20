import "server-only";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";

/** Read queries for the editorial workspace (editor role only; see requireEditor). */

export async function dashboardCounts() {
  const db = await getDb();
  const byStatus = await db
    .select({ status: schema.contentVersions.status, n: sql<number>`count(*)::int` })
    .from(schema.contentVersions)
    .groupBy(schema.contentVersions.status);
  const reports = await db
    .select({ status: schema.reports.status, n: sql<number>`count(*)::int` })
    .from(schema.reports)
    .groupBy(schema.reports.status);
  const since = new Date(Date.now() - 7 * 86_400_000);
  const answers = await db
    .select({ outcome: schema.answerRuns.outcome, n: sql<number>`count(*)::int` })
    .from(schema.answerRuns)
    .where(gte(schema.answerRuns.createdAt, since))
    .groupBy(schema.answerRuns.outcome);
  const m = <T extends { n: number }>(rows: T[], k: keyof T) => Object.fromEntries(rows.map((r) => [r[k] as string, r.n]));
  return { versions: m(byStatus, "status"), reports: m(reports, "status"), answers: m(answers, "outcome") };
}

export async function listItems() {
  const db = await getDb();
  const items = await db.select().from(schema.contentItems).orderBy(schema.contentItems.kind, schema.contentItems.slug);
  const versions = await db
    .select({
      id: schema.contentVersions.id,
      itemId: schema.contentVersions.itemId,
      language: schema.contentVersions.language,
      versionNo: schema.contentVersions.versionNo,
      status: schema.contentVersions.status,
      body: schema.contentVersions.body,
      createdAt: schema.contentVersions.createdAt,
    })
    .from(schema.contentVersions)
    .orderBy(desc(schema.contentVersions.versionNo));
  return items.map((it) => {
    const vs = versions.filter((v) => v.itemId === it.id);
    return {
      ...it,
      title: (vs[0]?.body as { title?: string } | undefined)?.title ?? it.slug,
      versions: vs.map(({ body: _b, ...rest }) => rest), // eslint-disable-line @typescript-eslint/no-unused-vars
    };
  });
}

export async function itemDetail(itemId: string) {
  const db = await getDb();
  const [item] = await db.select().from(schema.contentItems).where(eq(schema.contentItems.id, itemId));
  if (!item) return null;
  const versions = await db
    .select()
    .from(schema.contentVersions)
    .where(eq(schema.contentVersions.itemId, itemId))
    .orderBy(schema.contentVersions.language, desc(schema.contentVersions.versionNo));
  const ids = versions.map((v) => v.id);
  const reviews = ids.length
    ? await db
        .select({ r: schema.editorialReviews, email: schema.users.email })
        .from(schema.editorialReviews)
        .leftJoin(schema.users, eq(schema.users.id, schema.editorialReviews.reviewerId))
        .where(inArray(schema.editorialReviews.versionId, ids))
        .orderBy(desc(schema.editorialReviews.createdAt))
    : [];
  const audit = ids.length
    ? await db.select().from(schema.auditLog).where(and(eq(schema.auditLog.targetType, "content_version"), inArray(schema.auditLog.targetId, ids))).orderBy(desc(schema.auditLog.createdAt)).limit(50)
    : [];
  const entities = await db
    .select({ id: schema.entities.id, name: schema.entities.canonicalName, role: schema.itemEntities.role })
    .from(schema.itemEntities)
    .innerJoin(schema.entities, eq(schema.entities.id, schema.itemEntities.entityId))
    .where(eq(schema.itemEntities.itemId, itemId));
  return { item, versions, reviews, audit, entities };
}

export async function listReports(status?: string) {
  const db = await getDb();
  const statuses = schema.reports.status.enumValues as readonly string[];
  const where = status && statuses.includes(status) ? eq(schema.reports.status, status as (typeof schema.reports.status.enumValues)[number]) : undefined;
  return db.select().from(schema.reports).where(where).orderBy(desc(schema.reports.createdAt)).limit(200);
}

export async function listAnswerRuns(outcome?: string) {
  const db = await getDb();
  const outcomes = schema.answerRuns.outcome.enumValues as readonly string[];
  const where = outcome && outcomes.includes(outcome) ? eq(schema.answerRuns.outcome, outcome as (typeof schema.answerRuns.outcome.enumValues)[number]) : undefined;
  return db.select().from(schema.answerRuns).where(where).orderBy(desc(schema.answerRuns.createdAt)).limit(200);
}

export async function listEntities() {
  const db = await getDb();
  return db.select().from(schema.entities).orderBy(schema.entities.canonicalName);
}
