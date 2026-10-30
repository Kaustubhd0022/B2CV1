import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

/* ------------------------------------------------------------------ */
/* Accounts and sessions — minimal data (FR-18, BR-09)                 */
/* ------------------------------------------------------------------ */

export const userRole = pgEnum("user_role", ["user", "editor"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  // Purpose: sign-in identifier and verification target. Nullable: a user may use phone only.
  email: text("email").unique(),
  emailVerifiedAt: ts("email_verified_at"),
  passwordHash: text("password_hash"),
  // Purpose: sign-in identifier (E.164). Nullable.
  phone: text("phone").unique(),
  phoneVerifiedAt: ts("phone_verified_at"),
  // Purpose: authorisation for editorial operations.
  role: userRole("role").notNull().default("user"),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const authIdentities = pgTable(
  "auth_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider", { enum: ["google", "apple"] }).notNull(),
    providerUserId: text("provider_user_id").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("auth_identities_provider_uid").on(t.provider, t.providerUserId)],
);

export const otpChallenges = pgTable(
  "otp_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channel: text("channel", { enum: ["email", "phone"] }).notNull(),
    // HMAC of the normalised target; the raw address/number is not stored here.
    targetHash: text("target_hash").notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: ts("expires_at").notNull(),
    consumedAt: ts("consumed_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("otp_target_idx").on(t.targetHash, t.createdAt)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Session-scoped language (OD-14 default: not persisted beyond the session).
    language: text("language"),
    // Session-only AI context (FR-17). Deleted with the session.
    askContext: jsonb("ask_context").$type<AskContextTurn[]>().notNull().default([]),
    // Random id used for privacy-conscious analytics; not linked in the analytics table.
    analyticsId: uuid("analytics_id").notNull().defaultRandom(),
    createdAt: ts("created_at").notNull().defaultNow(),
    expiresAt: ts("expires_at").notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export type AskContextTurn = { q: string; a: string; lang: string };

/* ------------------------------------------------------------------ */
/* Cultural knowledge model (PRD §9.1)                                 */
/* ------------------------------------------------------------------ */

export const cities = pgTable("cities", {
  slug: text("slug").primaryKey(),
  // Localised display names {lang: name}; English required.
  names: jsonb("names").$type<Record<string, string>>().notNull(),
  // Localised short theme line; flagged illustrative until editorially reviewed.
  taglines: jsonb("taglines").$type<Record<string, string>>().notNull().default({}),
  taglineReviewed: boolean("tagline_reviewed").notNull().default(false),
  image: jsonb("image").$type<ImageRef | null>(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type ImageRef = {
  src: string;
  alt: string;
  credit: string;
  rightsCleared: boolean;
};

export const entityType = pgEnum("entity_type", [
  "place",
  "practice",
  "tradition",
  "person",
  "concept",
  "artwork",
  "structure",
  "period",
  "institution",
  "event",
]);

export const entities = pgTable("entities", {
  id: text("id").primaryKey(),
  type: entityType("type").notNull(),
  canonicalName: text("canonical_name").notNull(),
  names: jsonb("names").$type<Record<string, string>>().notNull().default({}),
  aliases: text("aliases").array().notNull().default(sql`'{}'::text[]`),
  region: text("region"),
  description: text("description"),
  status: text("status", { enum: ["active", "retired"] }).notNull().default("active"),
});

export const sourceType = pgEnum("source_type", [
  "primary",
  "official",
  "academic",
  "specialist",
  "reference",
  "media",
  "community",
  "other",
]);

export const sources = pgTable("sources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  creator: text("creator"),
  publisher: text("publisher"),
  sourceType: sourceType("source_type").notNull(),
  // 1 = primary/official/academic/specialist, 2 = reference/media, 3 = other. Guides scrutiny only.
  tier: integer("tier").notNull(),
  url: text("url"),
  citation: text("citation"),
  language: text("language").notNull(),
  publishedDate: text("published_date"),
  accessedDate: text("accessed_date"),
  assessment: text("assessment"),
  linkStatus: text("link_status", { enum: ["unchecked", "ok", "broken"] })
    .notNull()
    .default("unchecked"),
  linkCheckedAt: ts("link_checked_at"),
});

export const contentKind = pgEnum("content_kind", ["story", "connection"]);
export const versionStatus = pgEnum("version_status", [
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "published",
  "withdrawn",
  "superseded",
]);

export const contentItems = pgTable(
  "content_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: contentKind("kind").notNull(),
    slug: text("slug").notNull(),
    citySlug: text("city_slug").references(() => cities.slug),
    // Development fixture: never served in production unless ALLOW_FIXTURE_CONTENT=true.
    isFixture: boolean("is_fixture").notNull().default(false),
    origin: text("origin", { enum: ["editorial", "ai_proposed"] }).notNull().default("editorial"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("content_items_kind_slug").on(t.kind, t.slug)],
);

export const contentVersions = pgTable(
  "content_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    language: text("language").notNull(),
    versionNo: integer("version_no").notNull(),
    // For translations/adaptations: the source-language version this derives from.
    translationOf: uuid("translation_of"),
    status: versionStatus("status").notNull().default("draft"),
    body: jsonb("body").notNull(),
    contentHash: text("content_hash").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: ts("approved_at"),
    publishedAt: ts("published_at"),
    withdrawnAt: ts("withdrawn_at"),
  },
  (t) => [
    uniqueIndex("content_versions_item_lang_no").on(t.itemId, t.language, t.versionNo),
    // NFR-12: at most one published version per item and language.
    uniqueIndex("content_versions_one_published")
      .on(t.itemId, t.language)
      .where(sql`status = 'published'`),
    index("content_versions_status_idx").on(t.status),
  ],
);

export const itemEntities = pgTable(
  "item_entities",
  {
    itemId: uuid("item_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id),
    role: text("role", { enum: ["subject", "from", "to", "mentioned"] }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.entityId, t.role] })],
);

export const epistemicStatus = pgEnum("epistemic_status", [
  "documented",
  "tradition",
  "interpretation",
  "contested",
  "uncertain",
]);

export const claims = pgTable(
  "claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    versionId: uuid("version_id")
      .notNull()
      .references(() => contentVersions.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    text: text("text").notNull(),
    claimType: text("claim_type", {
      enum: ["historical", "descriptive", "belief", "interpretive", "relationship"],
    }).notNull(),
    epistemic: epistemicStatus("epistemic").notNull(),
    scopeNote: text("scope_note"),
  },
  (t) => [uniqueIndex("claims_version_key").on(t.versionId, t.key)],
);

export const claimEvidence = pgTable(
  "claim_evidence",
  {
    // Surrogate key: one claim may cite several passages from the same source.
    id: uuid("id").primaryKey().defaultRandom(),
    claimId: uuid("claim_id")
      .notNull()
      .references(() => claims.id, { onDelete: "cascade" }),
    sourceId: text("source_id")
      .notNull()
      .references(() => sources.id),
    relation: text("relation", { enum: ["supports", "contradicts", "context"] }).notNull(),
    excerpt: text("excerpt"),
    locator: text("locator"),
    limitation: text("limitation"),
  },
  (t) => [index("claim_evidence_claim_idx").on(t.claimId), index("claim_evidence_source_idx").on(t.sourceId)],
);

/** Retrieval corpus: passages from published content and editorial sources. */
export const corpusPassages = pgTable(
  "corpus_passages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    versionId: uuid("version_id").references(() => contentVersions.id, { onDelete: "cascade" }),
    sourceId: text("source_id").references(() => sources.id),
    language: text("language").notNull(),
    heading: text("heading"),
    text: text("text").notNull(),
    tsv: tsvector("tsv").generatedAlwaysAs(sql`to_tsvector('simple', coalesce(heading,'') || ' ' || text)`),
  },
  (t) => [index("corpus_tsv_idx").using("gin", t.tsv)],
);

/* ------------------------------------------------------------------ */
/* Governance                                                          */
/* ------------------------------------------------------------------ */

export const editorialReviews = pgTable("editorial_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  versionId: uuid("version_id")
    .notNull()
    .references(() => contentVersions.id, { onDelete: "cascade" }),
  reviewerId: uuid("reviewer_id").references(() => users.id),
  decision: text("decision", {
    enum: ["submitted", "approve", "request_changes", "publish", "withdraw", "correction_opened"],
  }).notNull(),
  notes: text("notes"),
  checklist: jsonb("checklist").$type<Record<string, unknown>>(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id"),
    actorLabel: text("actor_label").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("audit_target_idx").on(t.targetType, t.targetId)],
);

export const reportCategory = pgEnum("report_category", [
  "unsupported_claim",
  "broken_source",
  "misleading_connection",
  "missing_perspective",
  "translation",
  "other",
]);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetType: text("target_type", { enum: ["story", "connection", "answer", "source", "product"] }).notNull(),
    targetRef: text("target_ref").notNull(),
    category: reportCategory("category").notNull(),
    details: text("details"),
    // Optional answer snapshot, only when the reporter explicitly chose to include it.
    snapshot: jsonb("snapshot").$type<Record<string, unknown> | null>(),
    language: text("language").notNull(),
    status: text("status", { enum: ["new", "triaged", "in_progress", "resolved", "dismissed"] })
      .notNull()
      .default("new"),
    resolutionNote: text("resolution_note"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [index("reports_status_idx").on(t.status)],
);

/** Audit of each answer's checks — no question text, no user id (FR-12). */
export const answerRuns = pgTable(
  "answer_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: ts("created_at").notNull().defaultNow(),
    language: text("language").notNull(),
    risk: text("risk", { enum: ["routine", "sensitive", "high_risk"] }).notNull(),
    outcome: text("outcome", {
      enum: ["routine_approved", "qualified", "abstained", "evidence_only", "failed"],
    }).notNull(),
    checks: jsonb("checks").$type<Record<string, unknown>[]>().notNull(),
    provider: text("provider").notNull(),
    model: text("model"),
    retrievalProviders: text("retrieval_providers").array().notNull(),
    sourceRefs: jsonb("source_refs").$type<{ id: string; url: string | null }[]>().notNull(),
    coverage: real("coverage"),
    latencyMs: integer("latency_ms").notNull(),
  },
  (t) => [index("answer_runs_outcome_idx").on(t.outcome, t.createdAt)],
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // Random per-session id; deliberately no user id.
    sessionRef: text("session_ref"),
    props: jsonb("props").$type<Record<string, string | number | boolean>>().notNull().default({}),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("analytics_name_idx").on(t.name, t.createdAt)],
);

/** Evidence of each NDA acceptance. No foreign key: the record must outlive the account. */
export const ndaAcceptances = pgTable(
  "nda_acceptances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    // Purpose: identifying the signer for the Company's legal record.
    name: text("name"),
    email: text("email"),
    version: text("version").notNull(),
    language: text("language"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    agreedAt: ts("agreed_at").notNull().defaultNow(),
  },
  (t) => [index("nda_acceptances_user_idx").on(t.userId, t.version)],
);
