ALTER TABLE "participants" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "participants_user_id_idx" ON "participants" ("user_id");--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");