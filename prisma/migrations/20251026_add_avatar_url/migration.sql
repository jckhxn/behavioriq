-- Add avatarUrl column to users table if it doesn't exist
DO $$
BEGIN
  ALTER TABLE "users" ADD COLUMN "avatarUrl" TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
