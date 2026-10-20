import { z } from "zod";

/** Shapes for editorial content files (content/**) and content_versions.body. */

export const EPISTEMIC = ["documented", "tradition", "interpretation", "contested", "uncertain"] as const;
export const SOURCE_TYPES = ["primary", "official", "academic", "specialist", "reference", "media", "community", "other"] as const;
export const RELATIONSHIP_TYPES = [
  "documented_influence",
  "historical_exchange",
  "shared_lineage",
  "shared_imagery",
  "comparable_practice",
  "place_and_practice",
] as const;
export const SECTION_KINDS = ["narrative", "context", "significance", "evidence", "perspectives", "limits"] as const;

export const ImageRefSchema = z.object({
  src: z.string(),
  alt: z.string().min(3),
  credit: z.string(),
  rightsCleared: z.boolean(),
});

export const SourceDefSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  creator: z.string().optional(),
  publisher: z.string().optional(),
  sourceType: z.enum(SOURCE_TYPES),
  url: z.string().url().optional(),
  citation: z.string().optional(),
  language: z.string().min(2),
  publishedDate: z.string().optional(),
  accessedDate: z.string().optional(),
  assessment: z.string().optional(),
});
export type SourceDef = z.infer<typeof SourceDefSchema>;

export const EntityDefSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(["place", "practice", "tradition", "person", "concept", "artwork", "structure", "period", "institution", "event"]),
  canonicalName: z.string(),
  names: z.record(z.string(), z.string()).default({}),
  aliases: z.array(z.string()).default([]),
  region: z.string().optional(),
  description: z.string().optional(),
});

export const EvidenceSchema = z.object({
  source: z.string(),
  relation: z.enum(["supports", "contradicts", "context"]),
  excerpt: z.string().min(10),
  locator: z.string().optional(),
  limitation: z.string().optional(),
});

export const ClaimDefSchema = z.object({
  key: z.string().regex(/^[a-z0-9-]+$/),
  text: z.string().min(5),
  claimType: z.enum(["historical", "descriptive", "belief", "interpretive", "relationship"]),
  epistemic: z.enum(EPISTEMIC),
  scopeNote: z.string().optional(),
  evidence: z.array(EvidenceSchema).min(1),
});
export type ClaimDef = z.infer<typeof ClaimDefSchema>;

export const ParagraphSchema = z.object({
  text: z.string().min(1),
  claims: z.array(z.string()).default([]),
});

export const StoryBodySchema = z.object({
  title: z.string().min(3),
  orientation: z.string().min(10),
  hero: ImageRefSchema.optional(),
  sections: z
    .array(
      z.object({
        id: z.string(),
        kind: z.enum(SECTION_KINDS),
        heading: z.string(),
        paragraphs: z.array(ParagraphSchema).min(1),
      }),
    )
    .min(1),
  themes: z.array(z.string()).default([]),
  followUpQuestions: z.array(z.string()).default([]),
  connections: z.array(z.string()).default([]),
  relatedStories: z.array(z.string()).default([]),
});
export type StoryBody = z.infer<typeof StoryBodySchema>;

export const ConnectionBodySchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  relationshipType: z.enum(RELATIONSHIP_TYPES),
  from: z.object({ entity: z.string(), label: z.string() }),
  to: z.object({ entity: z.string(), label: z.string() }),
  rationale: z.array(ParagraphSchema).min(1),
  whyItMatters: z.array(ParagraphSchema).min(1),
  doesNotEstablish: z.string().min(10),
  uncertainty: z.string().optional(),
  relatedStories: z.array(z.string()).default([]),
});
export type ConnectionBody = z.infer<typeof ConnectionBodySchema>;

const VersionDefSchema = z.object({
  language: z.string().min(2),
  translationOf: z.string().optional(),
  body: z.unknown(),
  claims: z.array(ClaimDefSchema).default([]),
});

export const ItemFileSchema = z.object({
  kind: z.enum(["story", "connection"]),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  city: z.string().optional(),
  fixture: z.boolean().default(false),
  entities: z
    .array(z.object({ id: z.string(), role: z.enum(["subject", "from", "to", "mentioned"]) }))
    .default([]),
  versions: z.array(VersionDefSchema).min(1),
});
export type ItemFile = z.infer<typeof ItemFileSchema>;

export const CatalogFileSchema = z.object({
  sources: z.array(SourceDefSchema).default([]),
  entities: z.array(EntityDefSchema).default([]),
});

export const CitiesFileSchema = z.array(
  z.object({
    slug: z.string(),
    names: z.record(z.string(), z.string()),
    taglines: z.record(z.string(), z.string()).default({}),
    taglineReviewed: z.boolean().default(false),
    image: ImageRefSchema.nullable().default(null),
    sortOrder: z.number(),
  }),
);

export function parseBody(kind: "story" | "connection", body: unknown) {
  return kind === "story" ? StoryBodySchema.parse(body) : ConnectionBodySchema.parse(body);
}

export function tierFor(t: (typeof SOURCE_TYPES)[number]) {
  return ["primary", "official", "academic", "specialist"].includes(t) ? 1 : ["reference", "media"].includes(t) ? 2 : 3;
}
