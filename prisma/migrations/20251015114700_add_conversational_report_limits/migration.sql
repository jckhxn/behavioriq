-- Add conversational report limits to licenses and user license assignments

-- Licenses: track the maximum number of conversational reports a license allows
ALTER TABLE "public"."licenses"
ADD COLUMN IF NOT EXISTS "maxConversationalReports" INTEGER;

-- User licenses: track how many conversational reports are allocated and used
ALTER TABLE "public"."user_licenses"
ADD COLUMN IF NOT EXISTS "conversationalReportsAllowed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "conversationalReportsUsed" INTEGER NOT NULL DEFAULT 0;
