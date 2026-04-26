CREATE TABLE "campaign_participants" (
	"code" text NOT NULL UNIQUE,
	"voucher" text,
	"account_number" text,
	"attached_file" text,
	"campaign_id" serial,
	"participant_id" serial,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_participants_pkey" PRIMARY KEY("campaign_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"project_id" serial,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"last_name" text NOT NULL,
	"document_type" text NOT NULL,
	"document_number" text NOT NULL,
	"document_issue_date" date NOT NULL,
	"document_expiration_date" date,
	"document_issue_place" text NOT NULL,
	"birth_date" date NOT NULL,
	"birth_place" text NOT NULL,
	"email" text NOT NULL,
	"telegram_username" text,
	"phone" text,
	"residence_country" text,
	"residence_state" text,
	"residence_city" text,
	"address" text,
	"postal_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_participants_code_unique_idx" ON "campaign_participants" ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "campaigns_code_unique_idx" ON "campaigns" ("code");--> statement-breakpoint
CREATE INDEX "campaigns_project_id_idx" ON "campaigns" ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_code_unique_idx" ON "participants" ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_code_unique_idx" ON "projects" ("code");--> statement-breakpoint
ALTER TABLE "campaign_participants" ADD CONSTRAINT "campaign_participants_campaign_id_campaigns_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id");--> statement-breakpoint
ALTER TABLE "campaign_participants" ADD CONSTRAINT "campaign_participants_participant_id_participants_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id");--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");