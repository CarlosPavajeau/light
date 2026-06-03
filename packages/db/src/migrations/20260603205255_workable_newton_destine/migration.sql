ALTER TABLE "participants" ADD COLUMN "account_number" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "account_type" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "swift_code" text;--> statement-breakpoint
UPDATE "participants" AS "participant"
SET
  "account_number" = "latest_application"."account_number",
  "account_type" = "latest_application"."account_type",
  "bank_name" = "latest_application"."bank_name",
  "swift_code" = "latest_application"."swift_code"
FROM (
  SELECT DISTINCT ON ("participant_id")
    "participant_id",
    "account_number",
    "account_type",
    "bank_name",
    "swift_code"
  FROM "campaign_applications"
  WHERE
    "account_number" IS NOT NULL
    OR "account_type" IS NOT NULL
    OR "bank_name" IS NOT NULL
    OR "swift_code" IS NOT NULL
  ORDER BY "participant_id", "created_at" DESC
) AS "latest_application"
WHERE "participant"."id" = "latest_application"."participant_id";--> statement-breakpoint
ALTER TABLE "campaign_applications" DROP COLUMN "account_number";--> statement-breakpoint
ALTER TABLE "campaign_applications" DROP COLUMN "account_type";--> statement-breakpoint
ALTER TABLE "campaign_applications" DROP COLUMN "bank_name";--> statement-breakpoint
ALTER TABLE "campaign_applications" DROP COLUMN "swift_code";
