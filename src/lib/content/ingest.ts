import "server-only";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { config } from "@/lib/config";
import { getDb, schema } from "@/lib/db/client";
import { CatalogFileSchema, CitiesFileSchema, ItemFileSchema, parseBody, tierFor } from "./types";
import { approve, contentHash, createVersion, publish, submitForReview, type Actor } from "./workflow";

/**
 * Repeatable ingestion of editorial content files (content/**). Idempotent: unchanged
 * versions are skipped; any changed body or claim set becomes a NEW DRAFT version that
 * must go through review. Nothing is published by ingestion, except development fixtures
 * when explicitly requested outside production.
 */

export type IngestReport = {
  cities: number;
  sources: number;
  entities: number;
  created: { kind: string; slug: string; language: string; versionNo: number }[];
  unchanged: number;
  publishedFixtures: string[];
  errors: string[];
};

const SYSTEM: Actor = { id: null, label: "dev-fixture-seed", role: "system" };

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith(".json")) out.push(p);
  }
  return out;
}

export async function ingestContent(opts: { root?: string; publishFixtures?: boolean } = {}): Promise<IngestReport> {
  const root = opts.root ?? path.join(process.cwd(), "content");
  const db = await getDb();
  const report: IngestReport = { cities: 0, sources: 0, entities: 0, created: [], unchanged: 0, publishedFixtures: [], errors: [] };
  const allowFixturePublish = !!opts.publishFixtures && !config().isProd;

  const files = await walk(root);
  const json = async (f: string) => JSON.parse(await readFile(f, "utf8"));

  // 1. Cities (taxonomy)
  const citiesFile = files.find((f) => path.basename(f) === "cities.json");
  if (citiesFile) {
    for (const c of CitiesFileSchema.parse(await json(citiesFile))) {
      await db
        .insert(schema.cities)
        .values(c)
        .onConflictDoUpdate({
          target: schema.cities.slug,
          set: { names: c.names, taglines: c.taglines, taglineReviewed: c.taglineReviewed, image: c.image, sortOrder: c.sortOrder },
        });
      report.cities++;
    }
  }

  // 2. Catalogues: sources and entities
  for (const f of files.filter((f) => path.basename(f) === "catalog.json")) {
    const cat = CatalogFileSchema.parse(await json(f));
    for (const s of cat.sources) {
      const row = { ...s, tier: tierFor(s.sourceType) };
      await db.insert(schema.sources).values(row).onConflictDoUpdate({ target: schema.sources.id, set: row });
      report.sources++;
    }
    for (const e of cat.entities) {
      await db.insert(schema.entities).values(e).onConflictDoUpdate({ target: schema.entities.id, set: e });
      report.entities++;
    }
  }

  // 3. Content items
  const itemFiles = files.filter((f) => !["cities.json", "catalog.json"].includes(path.basename(f)));
  for (const f of itemFiles) {
    const rel = path.relative(root, f);
    const parsed = ItemFileSchema.safeParse(await json(f));
    if (!parsed.success) {
      report.errors.push(`${rel}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
      continue;
    }
    const item = parsed.data;
    try {
      let [row] = await db
        .select()
        .from(schema.contentItems)
        .where(and(eq(schema.contentItems.kind, item.kind), eq(schema.contentItems.slug, item.slug)))
        .limit(1);
      if (!row) {
        [row] = await db
          .insert(schema.contentItems)
          .values({ kind: item.kind, slug: item.slug, citySlug: item.city ?? null, isFixture: item.fixture })
          .returning();
      }
      await db.delete(schema.itemEntities).where(eq(schema.itemEntities.itemId, row.id));
      if (item.entities.length)
        await db.insert(schema.itemEntities).values(item.entities.map((e) => ({ itemId: row.id, entityId: e.id, role: e.role })));

      for (const ver of item.versions) {
        const body = parseBody(item.kind, ver.body);
        const hash = contentHash(body, ver.claims);
        const [same] = await db
          .select({ id: schema.contentVersions.id })
          .from(schema.contentVersions)
          .where(
            and(
              eq(schema.contentVersions.itemId, row.id),
              eq(schema.contentVersions.language, ver.language),
              eq(schema.contentVersions.contentHash, hash),
            ),
          )
          .limit(1);
        if (same) {
          report.unchanged++;
          continue;
        }
        const created = await db.transaction((tx) =>
          createVersion(tx as unknown as typeof db, row.id, ver.language, body, ver.claims, "ingest", ver.translationOf),
        );
        report.created.push({ kind: item.kind, slug: item.slug, language: ver.language, versionNo: created.versionNo });
        if (allowFixturePublish && item.fixture) {
          await submitForReview(created.id, SYSTEM);
          await approve(created.id, SYSTEM, { humanChecks: {}, allowSystemForFixture: true });
          await publish(created.id, SYSTEM, { allowSystemForFixture: true });
          report.publishedFixtures.push(`${item.kind}/${item.slug} (${ver.language})`);
        }
      }
    } catch (err) {
      report.errors.push(`${rel}: ${(err as Error).message}`);
    }
  }
  return report;
}
