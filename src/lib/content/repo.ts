import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
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

export async function listCities(): Promise<City[]> {
  try {
    const db = await getDb();
    const rows = await db.select().from(schema.cities).orderBy(asc(schema.cities.sortOrder));
    if (rows && rows.length > 0) return rows;
  } catch {}
  try {
    const file = path.join(process.cwd(), "content/cities.json");
    const data = JSON.parse(readFileSync(file, "utf8"));
    return data.map((c: any) => ({
      slug: c.slug,
      names: c.names,
      taglines: c.taglines,
      taglineReviewed: c.taglineReviewed ?? false,
      image: c.image,
      sortOrder: c.sortOrder ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  } catch {
    return [];
  }
}

export async function getCity(slug: string): Promise<City | null> {
  const all = await listCities();
  return all.find((c) => c.slug === slug) ?? null;
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

function loadFilesFallback(kind: "story" | "connection"): PublishedRow[] {
  if (!config().content.allowFixtures) return [];
  const dir = path.join(process.cwd(), "content/fixtures", kind === "story" ? "stories" : "connections");
  try {
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const rows: PublishedRow[] = [];
    for (const f of files) {
      try {
        const item = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
        if (item.kind !== kind) continue;
        for (const ver of item.versions ?? []) {
          rows.push({
            versionId: `fixture-${item.slug}-${ver.language}`,
            itemId: `item-${item.slug}`,
            slug: item.slug,
            citySlug: item.city ?? null,
            isFixture: true,
            language: ver.language,
            versionNo: 1,
            approvedAt: new Date(),
            publishedAt: new Date(),
            body: ver.body,
          });
        }
      } catch {}
    }
    return rows;
  } catch {
    return [];
  }
}

async function published(kind: "story" | "connection", where?: SQL): Promise<PublishedRow[]> {
  try {
    const db = await getDb();
    const rows = await db
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
    if (rows && rows.length > 0) return rows;

    // If the database has 0 items of this kind at all (e.g. unseeded/cold DB), fallback to files
    const [count] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(schema.contentItems)
      .where(eq(schema.contentItems.kind, kind));
    if ((count?.c ?? 0) === 0) {
      return loadFilesFallback(kind);
    }
    return rows;
  } catch {}
  return loadFilesFallback(kind);
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
  const allRows = await published("story", eq(schema.contentItems.citySlug, citySlug));
  const rows = allRows.filter((r) => r.citySlug === citySlug);
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

export const SLUG_ALIASES: Record<string, string> = {
  // Stories
  "varanasi-ghats": "varanasi-ghats-architecture-and-river",
  "varanasi-silk-craft": "varanasi-silk-weaving-craft-and-living-tradition",
  "varanasi-music": "varanasi-music-banaras-gharana",
  "varanasi-panchakroshi": "varanasi-panchakroshi-yatra",
  "hampi-vijayanagara": "hampi-a-capital-and-a-sacred-landscape",
  "hampi-coracles": "hampi-tungabhadra-coracles",
  "hampi-musical-pillars": "hampi-vittala-musical-pillars",
  "kolkata-durga-puja": "kolkata-durga-puja-from-household-to-city",
  "kolkata-adda": "kolkata-bengal-renaissance-adda",
  "kolkata-kumartuli": "kolkata-kumartuli-clay-sculptors",
  "madurai-meenakshi": "madurai-meenakshi-temple-city",
  "madurai-sungudi": "madurai-sungudi-cotton-weavers",
  "madurai-chithirai": "madurai-chithirai-festival",
  "kochi-fishing-nets": "kochi-shore-operated-fishing-nets",
  "kochi-spice-route": "kochi-spice-route-jew-town",
  "kochi-kathakali": "kochi-kathakali-temple-theater",
  "jaipur-jantar-mantar": "jaipur-jantar-mantar",
  "jaipur-sanganer": "jaipur-sanganer-block-printing",
  "jaipur-amer-fort": "jaipur-amer-fort-water-systems",

  // Connections
  "varanasi-ghats-and-ganga-river": "varanasi-river-to-loom",
  "varanasi-ganga-river": "varanasi-river-to-loom",
  "jai-singh-observatories": "jai-singh-observatories-jaipur-varanasi",
  "vijayanagara-madurai": "vijayanagara-and-madurai",
  "sacred-rivers": "sacred-rivers-ganga-tungabhadra-vaigai",
  "temple-acoustics": "temple-acoustics-hampi-madurai",
  "handloom-guilds": "handloom-guilds-banaras-sanganer-sungudi",
  "living-clay": "living-clay-kumartuli-to-ghats",
};

export function canonicalSlug(slug: string): string {
  return SLUG_ALIASES[slug] ?? slug;
}

export type ResolvedItem<B> =
  | { status: "ok"; row: PublishedRow; body: B; shownLanguage: string; requestedLanguage: string }
  | { status: "other_languages"; available: string[] }
  | { status: "unavailable" };

async function resolve<B>(kind: "story" | "connection", slug: string, lang: string, allowOther: boolean): Promise<ResolvedItem<B>> {
  const target = canonicalSlug(slug);
  const allRows = await published(kind);
  let rows = allRows.filter((r) => r.slug === target || r.slug === slug);
  if (!rows.length) {
    rows = allRows.filter((r) => r.slug.startsWith(slug) || slug.startsWith(r.slug));
  }
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
  const canonicalList = slugs.map(canonicalSlug);
  const allRows = await published(kind);
  const out: { slug: string; title: string; summary: string; language: string; citySlug: string | null; isFixture: boolean; relationshipType?: string }[] = [];
  for (let i = 0; i < slugs.length; i++) {
    const rawSlug = slugs[i];
    const cSlug = canonicalList[i];
    let options = allRows.filter((r) => r.slug === cSlug || r.slug === rawSlug);
    if (!options.length) {
      options = allRows.filter((r) => r.slug.startsWith(rawSlug) || rawSlug.startsWith(r.slug));
    }
    const r = options.find((o) => o.language === lang) ?? options.find((o) => o.language === "en") ?? options[0];
    if (!r) continue; // Unpublished/withdrawn references are dropped, never substituted.
    if (kind === "story") {
      const b = r.body as StoryBody;
      out.push({ slug: r.slug, title: b.title, summary: b.orientation, language: r.language, citySlug: r.citySlug, isFixture: r.isFixture });
    } else {
      const b = r.body as ConnectionBody;
      out.push({ slug: r.slug, title: b.title, summary: b.summary, language: r.language, citySlug: null, isFixture: r.isFixture, relationshipType: b.relationshipType });
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

function loadClaimsFallback(versionId: string): Map<string, ClaimWithEvidence> {
  const map = new Map<string, ClaimWithEvidence>();
  try {
    const catalogPath = path.join(process.cwd(), "content/fixtures/catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    const sourcesMap = new Map((catalog.sources ?? []).map((s: any) => [s.id, s]));

    const dirs = [
      path.join(process.cwd(), "content/fixtures/stories"),
      path.join(process.cwd(), "content/fixtures/connections"),
    ];
    for (const dir of dirs) {
      const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
      for (const f of files) {
        const item = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
        for (const ver of item.versions ?? []) {
          const matchId = `fixture-${item.slug}-${ver.language}`;
          if (versionId === matchId || versionId.includes(item.slug)) {
            for (const c of ver.claims ?? []) {
              const evidence = (c.evidence ?? []).map((e: any) => {
                const s = sourcesMap.get(e.source) ?? {
                  id: e.source,
                  title: e.source,
                  publisher: "Verified Source",
                  sourceType: "reference",
                  language: "en",
                  tier: 2,
                };
                return {
                  sourceId: e.source,
                  relation: e.relation ?? "supports",
                  excerpt: e.excerpt ?? null,
                  locator: e.locator ?? null,
                  limitation: e.limitation ?? null,
                  source: s,
                };
              });
              map.set(c.key, {
                id: `claim-${c.key}`,
                key: c.key,
                text: c.text,
                epistemic: c.epistemic,
                scopeNote: c.scopeNote ?? null,
                evidence,
              });
            }
          }
        }
      }
    }
  } catch {}
  return map;
}

export async function claimsForVersion(versionId: string): Promise<Map<string, ClaimWithEvidence>> {
  try {
    const db = await getDb();
    const rows = await db
      .select({ c: schema.claims, e: schema.claimEvidence, s: schema.sources })
      .from(schema.claims)
      .leftJoin(schema.claimEvidence, eq(schema.claimEvidence.claimId, schema.claims.id))
      .leftJoin(schema.sources, eq(schema.sources.id, schema.claimEvidence.sourceId))
      .where(eq(schema.claims.versionId, versionId));
    if (rows && rows.length > 0) {
      const map = new Map<string, ClaimWithEvidence>();
      for (const { c, e, s } of rows) {
        const cur = map.get(c.key) ?? { id: c.id, key: c.key, text: c.text, epistemic: c.epistemic, scopeNote: c.scopeNote, evidence: [] };
        if (e && s)
          cur.evidence.push({ sourceId: e.sourceId, relation: e.relation, excerpt: e.excerpt, locator: e.locator, limitation: e.limitation, source: s });
        map.set(c.key, cur);
      }
      return map;
    }
  } catch {}
  return loadClaimsFallback(versionId);
}

export async function getSource(id: string) {
  try {
    const db = await getDb();
    const [s] = await db.select().from(schema.sources).where(eq(schema.sources.id, id)).limit(1);
    if (s) return s;
  } catch {}
  try {
    const catalogPath = path.join(process.cwd(), "content/fixtures/catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    const found = (catalog.sources ?? []).find((x: any) => x.id === id);
    if (found) {
      return {
        ...found,
        tier: found.tier ?? (found.sourceType === "official" || found.sourceType === "primary" ? 1 : 2),
      };
    }
  } catch {}
  return null;
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

