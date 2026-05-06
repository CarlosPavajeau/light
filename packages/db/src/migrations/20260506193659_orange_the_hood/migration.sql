ALTER TABLE "participants" ADD COLUMN "passport_number" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "passport_issue_date" date;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "passport_expiration_date" date;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "passport_issue_place" text;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "leader" text;