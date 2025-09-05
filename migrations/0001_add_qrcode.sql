-- Create qrcode table if it does not exist
CREATE TABLE IF NOT EXISTS "qrcode" (
  "id" text PRIMARY KEY NOT NULL,
  "token" text NOT NULL UNIQUE,
  "hadir" boolean NOT NULL DEFAULT false,
  "souvenir" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

