-- AlterTable
ALTER TABLE "public"."question_sets" ADD COLUMN     "clinicallySignificantScore" INTEGER,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "multiPartLogic" JSONB,
ADD COLUMN     "prerequisites" JSONB,
ADD COLUMN     "skipConditions" JSONB,
ADD COLUMN     "totalPossibleScore" INTEGER;
