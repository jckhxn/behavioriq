-- Add emailVerified column to users table if it doesn't exist
DO $$
BEGIN
  ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN DEFAULT false;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
