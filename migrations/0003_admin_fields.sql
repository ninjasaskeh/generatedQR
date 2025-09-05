-- Admin plugin fields for Better Auth
-- Add to user table
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS "banned" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "ban_reason" text,
  ADD COLUMN IF NOT EXISTS "ban_expires" timestamp;

-- Add to session table
ALTER TABLE "session"
  ADD COLUMN IF NOT EXISTS "impersonated_by" text;

