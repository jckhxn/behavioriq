-- Add trial-to-full conversion flow columns to assessments table
-- Table name is "assessments" (lowercase) with @@map("assessments") in schema
-- Safe migration: all columns are nullable/have defaults

-- Add mode column (enum)
-- First ensure the enum type exists
DO $$
BEGIN
  CREATE TYPE "AssessmentMode" AS ENUM ('TRIAL', 'FULL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add mode column if it doesn't exist
DO $$
BEGIN
  ALTER TABLE "assessments" ADD COLUMN "mode" "AssessmentMode" NOT NULL DEFAULT 'TRIAL';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Add sessionId for anonymous trial linking
DO $$
BEGIN
  ALTER TABLE "assessments" ADD COLUMN "sessionId" TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Add paidAt timestamp
DO $$
BEGIN
  ALTER TABLE "assessments" ADD COLUMN "paidAt" TIMESTAMP(3);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Add aiReportGenerated flag (prevents cost overruns)
DO $$
BEGIN
  ALTER TABLE "assessments" ADD COLUMN "aiReportGenerated" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Add indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS "assessments_mode_idx" ON "assessments"("mode");
CREATE INDEX IF NOT EXISTS "assessments_sessionId_idx" ON "assessments"("sessionId");

-- Update existing assessments: set mode based on context
-- If userId is NOT NULL, assume it's a full assessment (user is authenticated)
UPDATE "assessments" SET "mode" = 'FULL' WHERE "userId" IS NOT NULL AND "mode" = 'TRIAL';
