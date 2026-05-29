CREATE EXTENSION IF NOT EXISTS "pg_trgm";--> statement-breakpoint
CREATE INDEX "users_name_search_idx" ON "users" USING gin (lower("name") gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "users_email_search_idx" ON "users" USING gin (lower("email") gin_trgm_ops);
