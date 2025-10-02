-- AlterTable
ALTER TABLE "public"."assessments" ADD COLUMN     "childResponses" JSONB,
ADD COLUMN     "enhancedAnalysis" JSONB,
ADD COLUMN     "enhancedReportPurchasedAt" TIMESTAMP(3),
ADD COLUMN     "hasEnhancedReport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isConversational" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "assessments_hasEnhancedReport_idx" ON "public"."assessments"("hasEnhancedReport");
