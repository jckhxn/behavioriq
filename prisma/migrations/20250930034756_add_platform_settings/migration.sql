-- CreateTable
CREATE TABLE "public"."platform_settings" (
    "id" TEXT NOT NULL,
    "globalTrialAssessmentId" TEXT,
    "globalRegularAssessmentId" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "registrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "trialAssessmentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiReportsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maxAiReportsPerUser" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."platform_settings" ADD CONSTRAINT "platform_settings_globalTrialAssessmentId_fkey" FOREIGN KEY ("globalTrialAssessmentId") REFERENCES "public"."assessment_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."platform_settings" ADD CONSTRAINT "platform_settings_globalRegularAssessmentId_fkey" FOREIGN KEY ("globalRegularAssessmentId") REFERENCES "public"."assessment_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
