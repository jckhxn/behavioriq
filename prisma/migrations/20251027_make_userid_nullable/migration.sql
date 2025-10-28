-- Make userId nullable to support anonymous trial assessments
-- This allows creating assessments without a user for trial users

ALTER TABLE "assessments" ALTER COLUMN "userId" DROP NOT NULL;
