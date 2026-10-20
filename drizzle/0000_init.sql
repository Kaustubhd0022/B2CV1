CREATE TYPE "public"."content_kind" AS ENUM('story', 'connection');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('place', 'practice', 'tradition', 'person', 'concept', 'artwork', 'structure', 'period', 'institution', 'event');--> statement-breakpoint
CREATE TYPE "public"."epistemic_status" AS ENUM('documented', 'tradition', 'interpretation', 'contested', 'uncertain');--> statement-breakpoint
CREATE TYPE "public"."report_category" AS ENUM('unsupported_claim', 'broken_source', 'misleading_connection', 'missing_perspective', 'translation', 'other');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('primary', 'official', 'academic', 'specialist', 'reference', 'media', 'community', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'editor');--> statement-breakpoint
CREATE TYPE "public"."version_status" AS ENUM('draft', 'in_review', 'changes_requested', 'approved', 'published', 'withdrawn', 'superseded');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"session_ref" text,
	"props" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answer_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"language" text NOT NULL,
	"risk" text NOT NULL,
	"outcome" text NOT NULL,
	"checks" jsonb NOT NULL,
	"provider" text NOT NULL,
	"model" text,
	"retrieval_providers" text[] NOT NULL,
	"source_refs" jsonb NOT NULL,
	"coverage" real,
	"latency_ms" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_label" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"slug" text PRIMARY KEY NOT NULL,
	"names" jsonb NOT NULL,
	"taglines" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tagline_reviewed" boolean DEFAULT false NOT NULL,
	"image" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_id" uuid NOT NULL,
	"source_id" text NOT NULL,
	"relation" text NOT NULL,
	"excerpt" text,
	"locator" text,
	"limitation" text
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"key" text NOT NULL,
	"text" text NOT NULL,
	"claim_type" text NOT NULL,
	"epistemic" "epistemic_status" NOT NULL,
	"scope_note" text
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "content_kind" NOT NULL,
	"slug" text NOT NULL,
	"city_slug" text,
	"is_fixture" boolean DEFAULT false NOT NULL,
	"origin" text DEFAULT 'editorial' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"language" text NOT NULL,
	"version_no" integer NOT NULL,
	"translation_of" uuid,
	"status" "version_status" DEFAULT 'draft' NOT NULL,
	"body" jsonb NOT NULL,
	"content_hash" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"withdrawn_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "corpus_passages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid,
	"source_id" text,
	"language" text NOT NULL,
	"heading" text,
	"text" text NOT NULL,
	"tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple', coalesce(heading,'') || ' ' || text)) STORED
);
--> statement-breakpoint
CREATE TABLE "editorial_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"reviewer_id" uuid,
	"decision" text NOT NULL,
	"notes" text,
	"checklist" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "entity_type" NOT NULL,
	"canonical_name" text NOT NULL,
	"names" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"aliases" text[] DEFAULT '{}'::text[] NOT NULL,
	"region" text,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_entities" (
	"item_id" uuid NOT NULL,
	"entity_id" text NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "item_entities_item_id_entity_id_role_pk" PRIMARY KEY("item_id","entity_id","role")
);
--> statement-breakpoint
CREATE TABLE "otp_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" text NOT NULL,
	"target_hash" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" text NOT NULL,
	"target_ref" text NOT NULL,
	"category" "report_category" NOT NULL,
	"details" text,
	"snapshot" jsonb,
	"language" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"resolution_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" uuid NOT NULL,
	"language" text,
	"ask_context" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"analytics_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"creator" text,
	"publisher" text,
	"source_type" "source_type" NOT NULL,
	"tier" integer NOT NULL,
	"url" text,
	"citation" text,
	"language" text NOT NULL,
	"published_date" text,
	"accessed_date" text,
	"assessment" text,
	"link_status" text DEFAULT 'unchecked' NOT NULL,
	"link_checked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"email_verified_at" timestamp with time zone,
	"phone" text,
	"phone_verified_at" timestamp with time zone,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_version_id_content_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."content_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_city_slug_cities_slug_fk" FOREIGN KEY ("city_slug") REFERENCES "public"."cities"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_item_id_content_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corpus_passages" ADD CONSTRAINT "corpus_passages_version_id_content_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."content_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corpus_passages" ADD CONSTRAINT "corpus_passages_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_reviews" ADD CONSTRAINT "editorial_reviews_version_id_content_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."content_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_reviews" ADD CONSTRAINT "editorial_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_entities" ADD CONSTRAINT "item_entities_item_id_content_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_entities" ADD CONSTRAINT "item_entities_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_name_idx" ON "analytics_events" USING btree ("name","created_at");--> statement-breakpoint
CREATE INDEX "answer_runs_outcome_idx" ON "answer_runs" USING btree ("outcome","created_at");--> statement-breakpoint
CREATE INDEX "audit_target_idx" ON "audit_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_provider_uid" ON "auth_identities" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE INDEX "claim_evidence_claim_idx" ON "claim_evidence" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "claim_evidence_source_idx" ON "claim_evidence" USING btree ("source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "claims_version_key" ON "claims" USING btree ("version_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "content_items_kind_slug" ON "content_items" USING btree ("kind","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "content_versions_item_lang_no" ON "content_versions" USING btree ("item_id","language","version_no");--> statement-breakpoint
CREATE UNIQUE INDEX "content_versions_one_published" ON "content_versions" USING btree ("item_id","language") WHERE status = 'published';--> statement-breakpoint
CREATE INDEX "content_versions_status_idx" ON "content_versions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "corpus_tsv_idx" ON "corpus_passages" USING gin ("tsv");--> statement-breakpoint
CREATE INDEX "otp_target_idx" ON "otp_challenges" USING btree ("target_hash","created_at");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");