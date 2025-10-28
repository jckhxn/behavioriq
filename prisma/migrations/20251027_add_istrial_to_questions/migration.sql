-- Add isTrial flag to questions table
-- This allows marking individual questions as part of the trial assessment
-- within the globally configured full assessment

DO $$
BEGIN
  ALTER TABLE "questions" ADD COLUMN "isTrial" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create index for efficient trial question filtering
CREATE INDEX IF NOT EXISTS "questions_istrial_idx" ON "questions"("isTrial");
