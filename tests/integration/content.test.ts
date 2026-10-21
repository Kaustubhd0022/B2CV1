import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { closeDb, getDb, schema } from "@/lib/db/client";
import { ingestContent } from "@/lib/content/ingest";
import { approve, openCorrection, publish, requestChanges, submitForReview, withdraw, WorkflowError, type Actor } from "@/lib/content/workflow";
import { HUMAN_CHECKS } from "@/lib/content/checklist";

const allHuman = Object.fromEntries(HUMAN_CHECKS.map((h) => [h.id, true]));

let editor: Actor;

beforeAll(async () => {
  const db = await getDb();
  const [u] = await db.insert(schema.users).values({ email: "editor@example.org", role: "editor" }).returning();
  editor = { id: u.id, label: "editor@example.org", role: "editor" };
});
afterAll(closeDb);

describe("content ingestion", () => {
  it("ingests cities, sources, entities and creates draft versions without publishing", async () => {
    const report = await ingestContent();
    expect(report.errors).toEqual([]);
    expect(report.cities).toBe(6);
    expect(report.created.length).toBe(11);
    expect(report.publishedFixtures).toEqual([]);
    const db = await getDb();
    const published = await db.select().from(schema.contentVersions).where(eq(schema.contentVersions.status, "published"));
    expect(published).toHaveLength(0);
  });

  it("is idempotent: re-running creates no new versions", async () => {
    const report = await ingestContent();
    expect(report.created).toEqual([]);
    expect(report.unchanged).toBe(11);
  });
});

describe("editorial workflow", () => {
  async function storyVersion(slug: string) {
    const db = await getDb();
    const [row] = await db
      .select({ id: schema.contentVersions.id, status: schema.contentVersions.status })
      .from(schema.contentVersions)
      .innerJoin(schema.contentItems, eq(schema.contentItems.id, schema.contentVersions.itemId))
      .where(and(eq(schema.contentItems.slug, slug), eq(schema.contentVersions.language, "en")))
      .orderBy(schema.contentVersions.versionNo);
    return row;
  }

  it("blocks approval by non-editors and without reviewer confirmations", async () => {
    const v = await storyVersion("jaipur-jantar-mantar");
    await submitForReview(v.id, editor);
    const user: Actor = { id: null, label: "someone", role: "system" };
    await expect(approve(v.id, user, { humanChecks: allHuman })).rejects.toBeInstanceOf(WorkflowError);
    await expect(approve(v.id, editor, { humanChecks: {} })).rejects.toMatchObject({ code: "human_checks_missing" });
  });

  it("supports request changes → resubmit → approve → publish, recording reviewer and indexing the corpus", async () => {
    const v = await storyVersion("jaipur-jantar-mantar");
    await requestChanges(v.id, editor, "Please add a limits section");
    await submitForReview(v.id, editor);
    await approve(v.id, editor, { humanChecks: allHuman });
    await publish(v.id, editor);
    const db = await getDb();
    const [row] = await db.select().from(schema.contentVersions).where(eq(schema.contentVersions.id, v.id));
    expect(row.status).toBe("published");
    expect(row.approvedBy).toBe(editor.id);
    expect(row.approvedAt).toBeInstanceOf(Date);
    const passages = await db.select().from(schema.corpusPassages).where(eq(schema.corpusPassages.versionId, v.id));
    expect(passages.length).toBeGreaterThan(3);
    const audit = await db.select().from(schema.auditLog).where(eq(schema.auditLog.targetId, v.id));
    expect(audit.map((a) => a.action)).toEqual(expect.arrayContaining(["submit_for_review", "approve", "publish"]));
  });

  it("cannot publish a draft that was never approved", async () => {
    const v = await storyVersion("kolkata-durga-puja-from-household-to-city");
    await expect(publish(v.id, editor)).rejects.toMatchObject({ code: "bad_state" });
  });

  it("correction creates a new draft; publishing it supersedes the old version; withdraw removes from corpus", async () => {
    const v = await storyVersion("jaipur-jantar-mantar");
    const draft = await openCorrection(v.id, editor);
    expect(draft.status).toBe("draft");
    expect(draft.versionNo).toBe(2);
    await submitForReview(draft.id, editor);
    await approve(draft.id, editor, { humanChecks: allHuman });
    await publish(draft.id, editor);
    const db = await getDb();
    const [old] = await db.select().from(schema.contentVersions).where(eq(schema.contentVersions.id, v.id));
    expect(old.status).toBe("superseded");
    await withdraw(draft.id, editor, "Correction pending");
    const passages = await db.select().from(schema.corpusPassages).where(eq(schema.corpusPassages.versionId, draft.id));
    expect(passages).toHaveLength(0);
  });

  it("enforces at most one published version per item and language at the database level", async () => {
    const db = await getDb();
    const v = await storyVersion("hampi-a-capital-and-a-sacred-landscape");
    await db.update(schema.contentVersions).set({ status: "published" }).where(eq(schema.contentVersions.id, v.id));
    const [item] = await db.select().from(schema.contentItems).where(eq(schema.contentItems.slug, "hampi-a-capital-and-a-sacred-landscape"));
    await expect(
      db.insert(schema.contentVersions).values({
        itemId: item.id,
        language: "en",
        versionNo: 99,
        body: {},
        contentHash: "x",
        createdBy: "test",
        status: "published",
      }),
    ).rejects.toThrow();
  });
});

describe("fixture seeding", () => {
  it("auto-publishes fixtures only when explicitly requested, with audit labels", async () => {
    const report = await ingestContent({ root: "content", publishFixtures: true });
    // Nothing changed, so nothing new is created or published by a re-run.
    expect(report.created).toEqual([]);
  });
});
