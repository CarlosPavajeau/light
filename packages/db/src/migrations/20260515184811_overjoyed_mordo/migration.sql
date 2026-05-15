ALTER TABLE "campaign_applications" ALTER COLUMN "campaign_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "campaign_applications" ALTER COLUMN "campaign_id" SET DATA TYPE integer USING "campaign_id"::integer;--> statement-breakpoint
ALTER TABLE "campaign_applications" ALTER COLUMN "participant_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "campaign_applications" ALTER COLUMN "participant_id" SET DATA TYPE integer USING "participant_id"::integer;
