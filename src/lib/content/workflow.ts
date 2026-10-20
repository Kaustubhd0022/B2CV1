import "server-only";
import { and, desc, eq, inArray, max, ne } from "drizzle-orm";
import { getDb, schema, type DB } from "@/lib/db/client";
import { sha256 } from "@/lib/auth/crypto";
import { HUMAN_CHECKS, runChecklist, type ChecklistItem } from "./checklist";
import { ConnectionBodySchema, StoryBodySchema, type ClaimDef } from "./types";

/**
 * Editorial workflow (FR-13, IA §2 "Editorial roles"):
 *   draft → in_review → (changes_requested → in_review)* → approved → published
 *   published → withdrawn;  published|withdrawn → (new draft via correction)
 * Only users with the editor role may approve or publish. AI never approves.
 */

export type Actor = { id: string | null; label: string; role: "editor" | "system" };

export class WorkflowError extends Error {
  constructor(
    public code: "not_found" | "bad_state" | "forbidden" | "checklist_failed" | "human_checks_missing",
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

type Status = (typeof schema.versionStatus.enumValues)[number];

async function audit(db: DB, actor: Actor, action: string, targetId: string, details: Record<string, unknown> = {}) {
  await db.insert(schema.auditLog).values({
    actorId: actor.id,
    actorLabel: actor.label,
    action,
    targetType: "content_version",
    targetId,
    details,
  });
}

async function loadVersion(db: DB, versionId: string) {
  const [row] = await db
    .select({ v: schema.contentVersions, item: schema.contentItems })
    .from(schema.contentVersions)
    .innerJoin(schema.contentItems, eq(schema.contentItems.id, schema.contentVersions.itemId))
    .where(eq(schema.contentVersions.id, versionId))
    .limit(1);
  if (!row) throw new WorkflowError("not_found", "Version not found");
  return row;
}

function expect(status: Status, allowed: Status[]) {
  if (!allowed.includes(status)) throw new WorkflowError("bad_state", `Not allowed from status '${status}'`);
}

/** Loads a version's claims with evidence in checklist shape. */
export async function versionClaims(db: DB, versionId: string): Promise<ClaimDef[]> {
  const rows = await db
    .select({ c: schema.claims, e: schema.claimEvidence })
    .from(schema.claims)
    .leftJoin(schema.claimEvidence, eq(schema.claimEvidence.claimId, schema.claims.id))
    .where(eq(schema.claims.versionId, versionId));
  const map = new Map<string, ClaimDef>();
  for (const { c, e } of rows) {
    const cur =
      map.get(c.id) ??
      ({ key: c.key, text: c.text, claimType: c.claimType, epistemic: c.epistemic, scopeNote: c.scopeNote ?? undefined, evidence: [] } as ClaimDef);
    if (e)
      cur.evidence.push({
        source: e.sourceId,
        relation: e.relation,
        excerpt: e.excerpt ?? "",
        locator: e.locator ?? undefined,
        limitation: e.limitation ?? undefined,
      });
    map.set(c.id, cur);
  }
  return [...map.values()];
}

export async function checklistFor(db: DB, versionId: string): Promise<ChecklistItem[]> {
  const { v, item } = await loadVersion(db, versionId);
  const claims = await versionClaims(db, versionId);
  const ids = [...new Set(claims.flatMap((c) => c.evidence.map((e) => e.source)))];
  const srcRows = ids.length
    ? await db.select().from(schema.sources).where(inArray(schema.sources.id, ids))
    : [];
  const srcMap = new Map(srcRows.map((s) => [s.id, s]));
  return runChecklist(item.kind, v.body, claims, (id) => srcMap.get(id));
}

export async function submitForReview(versionId: string, actor: Actor) {
  const db = await getDb();
  const { v } = await loadVersion(db, versionId);
  expect(v.status, ["draft", "changes_requested"]);
  const checklist = await checklistFor(db, versionId);
  await db.update(schema.contentVersions).set({ status: "in_review" }).where(eq(schema.contentVersions.id, versionId));
  await db.insert(schema.editorialReviews).values({
    versionId,
    reviewerId: actor.id,
    decision: "submitted",
    checklist: Object.fromEntries(checklist.map((c) => [c.id, c.ok])),
  });
  await audit(db, actor, "submit_for_review", versionId);
  return checklist;
}

export async function requestChanges(versionId: string, actor: Actor, notes: string) {
  if (actor.role !== "editor") throw new WorkflowError("forbidden", "Only editors can review");
  const db = await getDb();
  const { v } = await loadVersion(db, versionId);
  expect(v.status, ["in_review"]);
  await db.update(schema.contentVersions).set({ status: "changes_requested" }).where(eq(schema.contentVersions.id, versionId));
  await db.insert(schema.editorialReviews).values({ versionId, reviewerId: actor.id, decision: "request_changes", notes });
  await audit(db, actor, "request_changes", versionId, { notes });
}

export async function approve(
  versionId: string,
  actor: Actor,
  opts: { notes?: string; humanChecks: Record<string, boolean>; allowSystemForFixture?: boolean },
) {
  const db = await getDb();
  const { v, item } = await loadVersion(db, versionId);
  // Fixture seeding is the only non-editor path, and only for development fixtures.
  const systemFixture = actor.role === "system" && opts.allowSystemForFixture && item.isFixture;
  if (actor.role !== "editor" && !systemFixture) throw new WorkflowError("forbidden", "Only editors can approve");
  expect(v.status, ["in_review"]);
  const checklist = await checklistFor(db, versionId);
  const failed = checklist.filter((c) => !c.ok);
  if (failed.length) throw new WorkflowError("checklist_failed", "Automated checklist failed", failed);
  if (!systemFixture) {
    const missing = HUMAN_CHECKS.filter((h) => !opts.humanChecks[h.id]).map((h) => h.id);
    if (missing.length) throw new WorkflowError("human_checks_missing", "Reviewer confirmations missing", missing);
  }
  await db
    .update(schema.contentVersions)
    .set({ status: "approved", approvedBy: actor.id, approvedAt: new Date() })
    .where(eq(schema.contentVersions.id, versionId));
  await db.insert(schema.editorialReviews).values({
    versionId,
    reviewerId: actor.id,
    decision: "approve",
    notes: opts.notes ?? (systemFixture ? "DEVELOPMENT FIXTURE auto-approval — not an editorial review" : null),
    checklist: { ...Object.fromEntries(checklist.map((c) => [c.id, c.ok])), ...opts.humanChecks },
  });
  await audit(db, actor, systemFixture ? "fixture_auto_approve" : "approve", versionId, { version: v.versionNo });
}

/** Builds retrieval passages for a published version (one per paragraph). */
async function indexVersion(db: DB, versionId: string, kind: "story" | "connection", language: string, body: unknown) {
  await db.delete(schema.corpusPassages).where(eq(schema.corpusPassages.versionId, versionId));
  const rows: (typeof schema.corpusPassages.$inferInsert)[] = [];
  if (kind === "story") {
    const s = StoryBodySchema.parse(body);
    for (const sec of s.sections)
      for (const p of sec.paragraphs) rows.push({ versionId, language, heading: `${s.title} — ${sec.heading}`, text: p.text });
  } else {
    const c = ConnectionBodySchema.parse(body);
    for (const p of [...c.rationale, ...c.whyItMatters]) rows.push({ versionId, language, heading: c.title, text: p.text });
    rows.push({ versionId, language, heading: `${c.title} — limits`, text: c.doesNotEstablish });
  }
  // Verbatim excerpts from the editorial sources, attributed to the original source.
  const evidence = await db
    .select({ sourceId: schema.claimEvidence.sourceId, excerpt: schema.claimEvidence.excerpt, srcLang: schema.sources.language, title: schema.sources.title })
    .from(schema.claimEvidence)
    .innerJoin(schema.claims, eq(schema.claims.id, schema.claimEvidence.claimId))
    .innerJoin(schema.sources, eq(schema.sources.id, schema.claimEvidence.sourceId))
    .where(eq(schema.claims.versionId, versionId));
  const seen = new Set<string>();
  for (const e of evidence) {
    if (!e.excerpt || seen.has(e.excerpt)) continue;
    seen.add(e.excerpt);
    rows.push({ versionId, sourceId: e.sourceId, language: e.srcLang, heading: e.title, text: e.excerpt });
  }
  if (rows.length) await db.insert(schema.corpusPassages).values(rows);
}

export async function publish(versionId: string, actor: Actor, opts: { allowSystemForFixture?: boolean } = {}) {
  const db = await getDb();
  const { v, item } = await loadVersion(db, versionId);
  const systemFixture = actor.role === "system" && opts.allowSystemForFixture && item.isFixture;
  if (actor.role !== "editor" && !systemFixture) throw new WorkflowError("forbidden", "Only editors can publish");
  expect(v.status, ["approved"]);
  await db.transaction(async (tx) => {
    const t = tx as unknown as DB;
    const previous = await t
      .select({ id: schema.contentVersions.id })
      .from(schema.contentVersions)
      .where(
        and(
          eq(schema.contentVersions.itemId, v.itemId),
          eq(schema.contentVersions.language, v.language),
          eq(schema.contentVersions.status, "published"),
          ne(schema.contentVersions.id, versionId),
        ),
      );
    for (const p of previous) {
      await t.update(schema.contentVersions).set({ status: "superseded" }).where(eq(schema.contentVersions.id, p.id));
      await t.delete(schema.corpusPassages).where(eq(schema.corpusPassages.versionId, p.id));
    }
    await t
      .update(schema.contentVersions)
      .set({ status: "published", publishedAt: new Date(), withdrawnAt: null })
      .where(eq(schema.contentVersions.id, versionId));
    await indexVersion(t, versionId, item.kind, v.language, v.body);
    await t.insert(schema.editorialReviews).values({ versionId, reviewerId: actor.id, decision: "publish" });
    await audit(t, actor, systemFixture ? "fixture_auto_publish" : "publish", versionId, {
      superseded: previous.map((p) => p.id),
    });
  });
}

export async function withdraw(versionId: string, actor: Actor, notes: string) {
  if (actor.role !== "editor") throw new WorkflowError("forbidden", "Only editors can withdraw");
  const db = await getDb();
  const { v } = await loadVersion(db, versionId);
  expect(v.status, ["published"]);
  await db
    .update(schema.contentVersions)
    .set({ status: "withdrawn", withdrawnAt: new Date() })
    .where(eq(schema.contentVersions.id, versionId));
  await db.delete(schema.corpusPassages).where(eq(schema.corpusPassages.versionId, versionId));
  await db.insert(schema.editorialReviews).values({ versionId, reviewerId: actor.id, decision: "withdraw", notes });
  await audit(db, actor, "withdraw", versionId, { notes });
}

/** Material changes always produce a new draft version that needs fresh review. */
export async function createVersion(
  db: DB,
  itemId: string,
  language: string,
  body: unknown,
  claims: ClaimDef[],
  createdBy: string,
  translationOf?: string | null,
) {
  const hash = contentHash(body, claims);
  const [{ n }] = await db
    .select({ n: max(schema.contentVersions.versionNo) })
    .from(schema.contentVersions)
    .where(and(eq(schema.contentVersions.itemId, itemId), eq(schema.contentVersions.language, language)));
  const [version] = await db
    .insert(schema.contentVersions)
    .values({
      itemId,
      language,
      versionNo: (n ?? 0) + 1,
      body,
      contentHash: hash,
      createdBy,
      translationOf: translationOf ?? null,
    })
    .returning();
  for (const c of claims) {
    const [claim] = await db
      .insert(schema.claims)
      .values({ versionId: version.id, key: c.key, text: c.text, claimType: c.claimType, epistemic: c.epistemic, scopeNote: c.scopeNote })
      .returning({ id: schema.claims.id });
    if (c.evidence.length)
      await db.insert(schema.claimEvidence).values(
        c.evidence.map((e) => ({
          claimId: claim.id,
          sourceId: e.source,
          relation: e.relation,
          excerpt: e.excerpt,
          locator: e.locator,
          limitation: e.limitation,
        })),
      );
  }
  return version;
}

export async function openCorrection(versionId: string, actor: Actor) {
  if (actor.role !== "editor") throw new WorkflowError("forbidden", "Only editors can open corrections");
  const db = await getDb();
  const { v } = await loadVersion(db, versionId);
  expect(v.status, ["published", "withdrawn", "superseded", "approved"]);
  const claims = await versionClaims(db, versionId);
  const draft = await createVersion(db, v.itemId, v.language, v.body, claims, actor.label, v.translationOf);
  await db.insert(schema.editorialReviews).values({ versionId, reviewerId: actor.id, decision: "correction_opened", notes: `New draft ${draft.id}` });
  await audit(db, actor, "open_correction", versionId, { draft: draft.id });
  return draft;
}

export function contentHash(body: unknown, claims: ClaimDef[]) {
  return sha256(JSON.stringify({ body, claims }));
}

export async function latestVersions(db: DB, itemId: string) {
  return db
    .select()
    .from(schema.contentVersions)
    .where(eq(schema.contentVersions.itemId, itemId))
    .orderBy(schema.contentVersions.language, desc(schema.contentVersions.versionNo));
}

export { StoryBodySchema, ConnectionBodySchema };
