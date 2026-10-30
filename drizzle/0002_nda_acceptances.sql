CREATE TABLE "nda_acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text,
	"email" text,
	"version" text NOT NULL,
	"language" text,
	"ip" text,
	"user_agent" text,
	"agreed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "nda_acceptances_user_idx" ON "nda_acceptances" USING btree ("user_id","version");--> statement-breakpoint
ALTER TABLE "nda_acceptances" ENABLE ROW LEVEL SECURITY;
