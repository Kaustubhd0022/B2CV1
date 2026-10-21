import "server-only";
import { and, asc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { config } from "@/lib/config";
import { getDb, schema } from "@/lib/db/client";
import type { ConnectionBody, StoryBody } from "./types";

/**
 * Public read layer. Every query here returns PUBLISHED versions only (NFR-12) and
 * excludes development fixtures unless ALLOW_FIXTURE_CONTENT permits them.
 */

const fixtureFilter = (): SQL | undefined =>
  config().content.allowFixtures ? undefined : eq(schema.contentItems.isFixture, false);

const publishedOf = (kind: "story" | "connection") =>
  and(eq(schema.contentItems.kind, kind), eq(schema.contentVersions.status, "published"), fixtureFilter());

export type City = typeof schema.cities.$inferSelect;

export async function listCities() {
  const db = await getDb();
  return db.select().from(schema.cities).orderBy(asc(schema.cities.sortOrder));
}

export async function getCity(slug: string) {
  const db = await getDb();
  const [c] = await db.select().from(schema.cities).where(eq(schema.cities.slug, slug)).limit(1);
  return c ?? null;
}

export function localName(names: Record<string, string>, lang: string) {
  return names[lang] ?? names.en ?? Object.values(names)[0] ?? "";
}

export type PublishedRow = {
  versionId: string;
  itemId: string;
  slug: string;
  citySlug: string | null;
  isFixture: boolean;
  language: string;
  versionNo: number;
  approvedAt: Date | null;
  publishedAt: Date | null;
  body: unknown;
};

async function published(kind: "story" | "connection", where?: SQL): Promise<PublishedRow[]> {
  const db = await getDb();
  return db
    .select({
      versionId: schema.contentVersions.id,
      itemId: schema.contentItems.id,
      slug: schema.contentItems.slug,
      citySlug: schema.contentItems.citySlug,
      isFixture: schema.contentItems.isFixture,
      language: schema.contentVersions.language,
      versionNo: schema.contentVersions.versionNo,
      approvedAt: schema.contentVersions.approvedAt,
      publishedAt: schema.contentVersions.publishedAt,
      body: schema.contentVersions.body,
    })
    .from(schema.contentVersions)
    .innerJoin(schema.contentItems, eq(schema.contentItems.id, schema.contentVersions.itemId))
    .where(and(publishedOf(kind), where))
    .orderBy(asc(schema.contentItems.createdAt));
}

/** Story counts per city: in the selected language, and in any language. */
export async function cityStoryCounts(lang: string) {
  const rows = await published("story");
  const counts = new Map<string, { inLang: number; any: number }>();
  const seen = new Set<string>();
  for (const r of rows) {
    if (!r.citySlug) continue;
    const c = counts.get(r.citySlug) ?? { inLang: 0, any: 0 };
    if (r.language === lang) c.inLang++;
    if (!seen.has(r.itemId)) {
      c.any++;
      seen.add(r.itemId);
    }
    counts.set(r.citySlug, c);
  }
  return counts;
}

export type StoryListItem = { slug: string; title: string; orientation: string; language: string; isFixture: boolean; sectionKinds: string[] };

/**
 * Stories for a city. In the selected language by default; `otherLanguages` is an
 * explicit user choice (never a silent substitution) and returns the best available language.
 */
export async function cityStories(citySlug: string, lang: string, otherLanguages = false): Promise<StoryListItem[]> {
  const rows = await published("story", eq(schema.contentItems.citySlug, citySlug));
  const byItem = new Map<string, PublishedRow>();
  for (const r of rows) {
    const cur = byItem.get(r.itemId);
    if (r.language === lang) byItem.set(r.itemId, r);
    else if (otherLanguages && (!cur || (cur.language !== lang && r.language === "en"))) byItem.set(r.itemId, r);
  }
  return [...byItem.values()].map((r) => {
    const b = r.body as StoryBody;
    return {
      slug: r.slug,
      title: b.title,
      orientation: b.orientation,
      language: r.language,
      isFixture: r.isFixture,
      sectionKinds: b.sections.map((s) => s.kind),
    };
  });
}

export type ResolvedItem<B> =
  | { status: "ok"; row: PublishedRow; body: B; shownLanguage: string; requestedLanguage: string }
  | { status: "other_languages"; available: string[] }
  | { status: "unavailable" };

async function resolve<B>(kind: "story" | "connection", slug: string, lang: string, allowOther: boolean): Promise<ResolvedItem<B>> {
  const rows = await published(kind, eq(schema.contentItems.slug, slug));
  if (!rows.length) return { status: "unavailable" };
  const exact = rows.find((r) => r.language === lang);
  if (exact) return { status: "ok", row: exact, body: exact.body as B, shownLanguage: lang, requestedLanguage: lang };
  if (!allowOther) return { status: "other_languages", available: rows.map((r) => r.language) };
  const pick = rows.find((r) => r.language === "en") ?? rows[0];
  return { status: "ok", row: pick, body: pick.body as B, shownLanguage: pick.language, requestedLanguage: lang };
}

export const getStory = (slug: string, lang: string, allowOther = false) => resolve<StoryBody>("story", slug, lang, allowOther);
export const getConnection = (slug: string, lang: string, allowOther = false) =>
  resolve<ConnectionBody>("connection", slug, lang, allowOther);

/** Lightweight cards for lists of stories/connections referenced by slug, best language first. */
export async function cardsBySlugs(kind: "story" | "connection", slugs: string[], lang: string) {
  if (!slugs.length) return [];
  const rows = await published(kind, inArray(schema.contentItems.slug, slugs));
  const out: { slug: string; title: string; summary: string; language: string; citySlug: string | null; isFixture: boolean; relationshipType?: string }[] = [];
  for (const slug of slugs) {
    const options = rows.filter((r) => r.slug === slug);
    const r = options.find((o) => o.language === lang) ?? options.find((o) => o.language === "en") ?? options[0];
    if (!r) continue; // Unpublished/withdrawn references are dropped, never substituted.
    if (kind === "story") {
      const b = r.body as StoryBody;
      out.push({ slug, title: b.title, summary: b.orientation, language: r.language, citySlug: r.citySlug, isFixture: r.isFixture });
    } else {
      const b = r.body as ConnectionBody;
      out.push({ slug, title: b.title, summary: b.summary, language: r.language, citySlug: null, isFixture: r.isFixture, relationshipType: b.relationshipType });
    }
  }
  return out;
}

export async function featuredConnection(lang: string) {
  const rows = await published("connection");
  if (!rows.length) return null;
  const preferred = rows.filter((r) => r.slug === "lotus-across-traditions");
  const pool = preferred.length ? preferred : rows;
  const r = pool.find((x) => x.language === lang) ?? pool.find((x) => x.language === "en") ?? pool[0];
  const b = r.body as ConnectionBody;
  return { slug: r.slug, title: b.title, summary: b.summary, language: r.language, isFixture: r.isFixture };
}

export type ClaimWithEvidence = {
  id: string;
  key: string;
  text: string;
  epistemic: "documented" | "tradition" | "interpretation" | "contested" | "uncertain";
  scopeNote: string | null;
  evidence: {
    sourceId: string;
    relation: "supports" | "contradicts" | "context";
    excerpt: string | null;
    locator: string | null;
    limitation: string | null;
    source: typeof schema.sources.$inferSelect;
  }[];
};

export async function claimsForVersion(versionId: string): Promise<Map<string, ClaimWithEvidence>> {
  const db = await getDb();
  const rows = await db
    .select({ c: schema.claims, e: schema.claimEvidence, s: schema.sources })
    .from(schema.claims)
    .leftJoin(schema.claimEvidence, eq(schema.claimEvidence.claimId, schema.claims.id))
    .leftJoin(schema.sources, eq(schema.sources.id, schema.claimEvidence.sourceId))
    .where(eq(schema.claims.versionId, versionId));
  const map = new Map<string, ClaimWithEvidence>();
  for (const { c, e, s } of rows) {
    const cur = map.get(c.key) ?? { id: c.id, key: c.key, text: c.text, epistemic: c.epistemic, scopeNote: c.scopeNote, evidence: [] };
    if (e && s)
      cur.evidence.push({ sourceId: e.sourceId, relation: e.relation, excerpt: e.excerpt, locator: e.locator, limitation: e.limitation, source: s });
    map.set(c.key, cur);
  }
  return map;
}

export async function getSource(id: string) {
  const db = await getDb();
  const [s] = await db.select().from(schema.sources).where(eq(schema.sources.id, id)).limit(1);
  return s ?? null;
}

/** Published items whose claims cite a source, with the claims they support. */
export async function sourceUsage(sourceId: string) {
  const db = await getDb();
  return db
    .select({
      kind: schema.contentItems.kind,
      slug: schema.contentItems.slug,
      language: schema.contentVersions.language,
      body: schema.contentVersions.body,
      claimKey: schema.claims.key,
      claimText: schema.claims.text,
      epistemic: schema.claims.epistemic,
      excerpt: schema.claimEvidence.excerpt,
      locator: schema.claimEvidence.locator,
      limitation: schema.claimEvidence.limitation,
    })
    .from(schema.claimEvidence)
    .innerJoin(schema.claims, eq(schema.claims.id, schema.claimEvidence.claimId))
    .innerJoin(schema.contentVersions, eq(schema.contentVersions.id, schema.claims.versionId))
    .innerJoin(schema.contentItems, eq(schema.contentItems.id, schema.contentVersions.itemId))
    .where(and(eq(schema.claimEvidence.sourceId, sourceId), eq(schema.contentVersions.status, "published"), fixtureFilter()));
}

/** Published story counts per language — feeds the language readiness display. */
export async function publishedStoryCountsByLanguage() {
  const db = await getDb();
  const rows = await db
    .select({ language: schema.contentVersions.language, n: sql<number>`count(*)::int` })
    .from(schema.contentVersions)
    .innerJoin(schema.contentItems, eq(schema.contentItems.id, schema.contentVersions.itemId))
    .where(publishedOf("story"))
    .groupBy(schema.contentVersions.language);
  return new Map(rows.map((r) => [r.language, r.n]));
}

export async function featuredStories(lang: string, limit = 4) {
  const rows = await published("story");
  const byItem = new Map<string, PublishedRow>();
  for (const r of rows) {
    const cur = byItem.get(r.itemId);
    if (r.language === lang) byItem.set(r.itemId, r);
    else if (!cur || (cur.language !== lang && r.language === "en")) byItem.set(r.itemId, r);
  }
  return [...byItem.values()].slice(0, limit).map((r) => {
    const b = r.body as StoryBody;
    return {
      slug: r.slug,
      title: b.title,
      orientation: b.orientation,
      language: r.language,
      citySlug: r.citySlug,
      isFixture: r.isFixture,
      hero: b.hero,
      themes: b.themes,
    };
  });
}

export async function listAllPublishedStories(lang: string) {
  const rows = await published("story");
  const byItem = new Map<string, PublishedRow>();
  for (const r of rows) {
    const cur = byItem.get(r.itemId);
    if (r.language === lang) byItem.set(r.itemId, r);
    else if (!cur || (cur.language !== lang && r.language === "en")) byItem.set(r.itemId, r);
  }
  return [...byItem.values()].map((r) => {
    const b = r.body as StoryBody;
    return {
      slug: r.slug,
      title: b.title,
      orientation: b.orientation,
      language: r.language,
      citySlug: r.citySlug,
      isFixture: r.isFixture,
      hero: b.hero,
      themes: b.themes,
    };
  });
}

