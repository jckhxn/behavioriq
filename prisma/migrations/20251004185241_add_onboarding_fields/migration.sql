-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingSkipped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0;
