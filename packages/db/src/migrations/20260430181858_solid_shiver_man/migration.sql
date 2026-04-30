ALTER TABLE "campaign_participants" RENAME TO "campaign_applications";--> statement-breakpoint
ALTER INDEX "campaign_participants_code_unique_idx" RENAME TO "campaign_applications_code_unique_idx";--> statement-breakpoint
ALTER TABLE "campaign_applications" RENAME CONSTRAINT "campaign_participants_pkey" TO "campaign_applications_pkey";