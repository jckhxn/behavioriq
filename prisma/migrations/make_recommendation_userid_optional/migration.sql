-- Make Recommendation.userId nullable to support anonymous assessments
ALTER TABLE "recommendations" ALTER COLUMN "userId" DROP NOT NULL;

-- Drop the foreign key constraint so we can recreate it as optional
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_userId_fkey";

-- Recreate the foreign key as optional (onDelete: Cascade)
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
