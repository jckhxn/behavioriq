-- Add missing email verification and management columns to users table
DO $$
BEGIN
  -- Add emailVerificationToken if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'emailVerificationToken'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "emailVerificationToken" TEXT UNIQUE;
  END IF;

  -- Add emailVerificationTokenExpiresAt if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'emailVerificationTokenExpiresAt'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "emailVerificationTokenExpiresAt" TIMESTAMP;
  END IF;

  -- Add pendingEmail if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'pendingEmail'
  ) THEN
    ALTER TABLE "users" ADD COLUMN "pendingEmail" TEXT;
  END IF;
END $$;
