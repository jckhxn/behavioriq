/*
  Warnings:

  - Added the required column `questionsAnswered` to the `scores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPossible` to the `scores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."assessments" ADD COLUMN     "currentDomain" "public"."AssessmentDomain",
ADD COLUMN     "currentQuestionOrder" INTEGER;

-- AlterTable
ALTER TABLE "public"."scores" ADD COLUMN     "questionsAnswered" INTEGER,
ADD COLUMN     "totalPossible" INTEGER,
ADD COLUMN     "wasTerminatedEarly" BOOLEAN NOT NULL DEFAULT false;

-- Update existing scores with default values for conversational mode
UPDATE "public"."scores" SET
  "questionsAnswered" = 10,  -- Default for conversational mode
  "totalPossible" = 100     -- Default for conversational mode
WHERE "questionsAnswered" IS NULL;

-- Make columns required after providing defaults
ALTER TABLE "public"."scores" ALTER COLUMN "questionsAnswered" SET NOT NULL;
ALTER TABLE "public"."scores" ALTER COLUMN "totalPossible" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."question_sets" (
    "id" TEXT NOT NULL,
    "domain" "public"."AssessmentDomain" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."questions" (
    "id" TEXT NOT NULL,
    "questionSetId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isGatingQuestion" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."termination_rules" (
    "id" TEXT NOT NULL,
    "questionSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minimumYesToContinue" INTEGER NOT NULL,
    "checkAfterQuestion" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "termination_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_responses" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "response" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_sets_domain_isActive_idx" ON "public"."question_sets"("domain", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "question_sets_domain_key" ON "public"."question_sets"("domain");

-- CreateIndex
CREATE INDEX "questions_questionSetId_isActive_idx" ON "public"."questions"("questionSetId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "questions_questionSetId_order_key" ON "public"."questions"("questionSetId", "order");

-- CreateIndex
CREATE INDEX "termination_rules_questionSetId_isActive_idx" ON "public"."termination_rules"("questionSetId", "isActive");

-- CreateIndex
CREATE INDEX "question_responses_assessmentId_idx" ON "public"."question_responses"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "question_responses_assessmentId_questionId_key" ON "public"."question_responses"("assessmentId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."questions" ADD CONSTRAINT "questions_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "public"."question_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."termination_rules" ADD CONSTRAINT "termination_rules_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES "public"."question_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_responses" ADD CONSTRAINT "question_responses_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_responses" ADD CONSTRAINT "question_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
