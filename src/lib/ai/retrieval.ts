import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { config } from "@/lib/config";
import { getDb, schema } from "@/lib/db/client";
import { languageInfo } from "@/lib/i18n/languages";
import { log } from "@/lib/log";
import type { ConnectionBody, StoryBody } from "@/lib/content/types";
import { overlapScore, stem, tokenize } from "./text";
import type { Passage, RetrievalOutcome, SourceRef } from "./types";

/**
 * Retrieval providers (configured via RETRIEVAL_PROVIDERS):
 *  - corpus:    TattvaCo's published editorial content + verbatim source excerpts (Postgres FTS).
 *  - wikipedia: MediaWiki API in the user's language and English (no key; external call,
 *               revision-pinned permalinks). Tertiary source: tier 2.
 * Keyword retrieval is used deliberately: the corpus is small and no embedding provider is
 * configured (see DECISIONS D-07).
 */

type Candidate = Omit<Passage, "id">;

const TIER_WEIGHT: Record<number, number> = { 1: 1, 2: 0.85, 3: 0.7 };

function tsQuery(q: string) {
  const terms = [...new Set(tokenize(q))].slice(0, 16);
  return terms.map((t) => (/^[a-z]{4,}$/.test(t) ? `${stem(t)}:*` : t)).join(" | ");
}

export async function corpusSearch(query: string, limit = 8): Promise<Candidate[]> {
  const tsq = tsQuery(query);
  if (!tsq) return [];
  const db = await getDb();
  const fixtureClause = config().content.allowFixtures ? undefined : eq(schema.contentItems.isFixture, false);
  const rank = sql<number>`ts_rank_cd(${schema.corpusPassages.tsv}, to_tsquery('simple', ${tsq}))`;
  const rows = await db
    .select({
      text: schema.corpusPassages.text,
      heading: schema.corpusPassages.heading,
      language: schema.corpusPassages.language,
      rank,
      kind: schema.contentItems.kind,
      slug: schema.contentItems.slug,
      isFixture: schema.contentItems.isFixture,
      body: schema.contentVersions.body,
      source: schema.sources,
    })
    .from(schema.corpusPassages)
    .innerJoin(schema.contentVersions, eq(schema.contentVersions.id, schema.corpusPassages.versionId))
    .innerJoin(schema.contentItems, eq(schema.contentItems.id, schema.contentVersions.itemId))
    .leftJoin(schema.sources, eq(schema.sources.id, schema.corpusPassages.sourceId))
    .where(and(sql`${schema.corpusPassages.tsv} @@ to_tsquery('simple', ${tsq})`, eq(schema.contentVersions.status, "published"), fixtureClause))
    .orderBy(desc(rank))
    .limit(limit * 2);

  return rows.map((r) => {
    const internal = { kind: r.kind, slug: r.slug, isFixture: r.isFixture };
    const title = r.kind === "story" ? (r.body as StoryBody).title : (r.body as ConnectionBody).title;
    const source: SourceRef = r.source
      ? {
          key: r.source.url ?? `src:${r.source.id}`,
          title: r.source.title,
          publisher: r.source.publisher,
          url: r.source.url,
          language: r.source.language,
          sourceType: r.source.sourceType,
          tier: r.source.tier as 1 | 2 | 3,
          internal,
        }
      : {
          key: `tattvaco:${r.kind}:${r.slug}`,
          title: `TattvaCo ${r.kind === "story" ? "story" : "connection"}: ${title}`,
          publisher: r.isFixture ? "TattvaCo (development sample, not editorially reviewed)" : "TattvaCo editorial",
          url: `/${r.kind === "story" ? "stories" : "connections"}/${r.slug}`,
          language: r.language,
          sourceType: "editorial",
          // Unreviewed fixtures are weighted like tertiary material, never as approved editorial.
          tier: r.isFixture ? 3 : 1,
          internal,
        };
    const lexical = overlapScore(query, `${r.heading ?? ""} ${r.text}`);
    // FTS rank orders candidates; the score used for sufficiency is query-term coverage, so a
    // single generic word ("festival") cannot make an unrelated passage look relevant.
    return { text: r.text, heading: r.heading ?? undefined, provider: "corpus" as const, source, score: lexical };
  });
}

// Wikimedia's API policy requires an identifying User-Agent with contact details.
const userAgent = () => process.env.WIKIPEDIA_USER_AGENT || `TattvaCo/0.1 (${config().appUrl})`;

// Short-lived cache of public reference responses to avoid repeated identical calls.
const g = globalThis as unknown as { __tcWiki?: Map<string, { at: number; data: unknown }> };
const wikiCache: Map<string, { at: number; data: unknown }> = (g.__tcWiki ??= new Map());
const WIKI_TTL_MS = 10 * 60_000;

async function wikiJson(wiki: string, params: Record<string, string>, signal: AbortSignal) {
  const url = `https://${wiki}.wikipedia.org/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  const hit = wikiCache.get(url);
  if (hit && Date.now() - hit.at < WIKI_TTL_MS) return hit.data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const res = await fetch(url, { headers: { "User-Agent": userAgent(), "Api-User-Agent": userAgent() }, signal });
  if (!res.ok) throw new Error(`wikipedia_http_${res.status}`);
  const data = await res.json();
  if (wikiCache.size > 500) wikiCache.clear();
  wikiCache.set(url, { at: Date.now(), data });
  return data;
}

export async function wikipediaSearch(query: string, lang: string, signal: AbortSignal, pages = 3): Promise<Candidate[]> {
  const wiki = languageInfo(lang).wiki;
  const search = await wikiJson(wiki, { action: "query", list: "search", srsearch: query, srlimit: String(pages), srprop: "" }, signal);
  const titles: string[] = (search?.query?.search ?? []).map((s: { title: string }) => s.title);
  const results: Candidate[][] = [];
  // Sequential page fetches keep request rates polite.
  for (const title of titles) {
    results.push(await (async () => {
      const d = await wikiJson(wiki, { action: "query", prop: "extracts|revisions", rvprop: "ids", explaintext: "1", redirects: "1", titles: title }, signal);
      const page = d?.query?.pages?.[0];
      if (!page?.extract) return [];
      const revid = page.revisions?.[0]?.revid as number | undefined;
      const source: SourceRef = {
        key: `wiki:${wiki}:${page.title}`,
        title: page.title,
        publisher: `Wikipedia (${languageInfo(lang).english})`,
        url: revid ? `https://${wiki}.wikipedia.org/w/index.php?oldid=${revid}` : `https://${wiki}.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
        language: lang,
        sourceType: "reference",
        tier: 2,
        revision: revid ? String(revid) : undefined,
      };
      const paragraphs = (page.extract as string)
        .split(/\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length >= 80 && !/^==/.test(p));
      return paragraphs
        .map((p, i) => ({ text: p.slice(0, 1500), heading: page.title, source, provider: "wikipedia" as const, score: overlapScore(query, p) + (i === 0 ? 0.1 : 0) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    })());
  }
  return results.flat();
}

/** Runs configured providers with timeouts, then dedupes, weights by tier and ranks. */
export async function retrieve(opts: { queryNative: string; queryEn: string; lang: string; limit?: number }): Promise<RetrievalOutcome> {
  const c = config();
  const providers = c.ai.retrievalProviders;
  const failed: string[] = [];
  const tasks: Promise<Candidate[]>[] = [];
  const run = (name: string, fn: (signal: AbortSignal) => Promise<Candidate[]>) => {
    const signal = AbortSignal.timeout(c.ai.retrievalTimeoutMs);
    tasks.push(
      fn(signal).catch((err) => {
        failed.push(name);
        log.warn("retrieval.provider_failed", { provider: name, error: (err as Error).message.slice(0, 60) });
        return [];
      }),
    );
  };

  if (providers.includes("corpus")) {
    run("corpus", async () => {
      const a = await corpusSearch(opts.queryEn);
      const b = opts.queryNative !== opts.queryEn ? await corpusSearch(opts.queryNative) : [];
      return [...a, ...b];
    });
  }
  if (providers.includes("wikipedia")) {
    if (opts.lang !== "en") run(`wikipedia:${opts.lang}`, (s) => wikipediaSearch(opts.queryNative, opts.lang, s, 2));
    run("wikipedia:en", (s) => wikipediaSearch(opts.queryEn, "en", s, 3));
  }
  const all = (await Promise.all(tasks)).flat();

  // Dedupe identical passages; weight by tier (scrutiny, not truth); rank.
  const seen = new Set<string>();
  const ranked = all
    .map((p) => ({ ...p, score: p.score * (TIER_WEIGHT[p.source.tier] ?? 0.7) }))
    .sort((a, b) => b.score - a.score)
    .filter((p) => {
      const k = p.text.slice(0, 160).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, opts.limit ?? 10);

  return {
    passages: ranked.map((p, i) => ({ ...p, id: `P${i + 1}` })),
    providersTried: providers.flatMap((p) => (p === "wikipedia" ? (opts.lang !== "en" ? [`wikipedia:${opts.lang}`, "wikipedia:en"] : ["wikipedia:en"]) : [p])),
    providersFailed: failed,
  };
}
