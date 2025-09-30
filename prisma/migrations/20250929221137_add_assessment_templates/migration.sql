/*
  Warnings:

  - A unique constraint covering the columns `[customDomain]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Role" ADD VALUE 'DISTRICT_ADMIN';
ALTER TYPE "public"."Role" ADD VALUE 'SUB_ACCOUNT';

-- AlterTable
ALTER TABLE "public"."assessments" ADD COLUMN     "assessmentTemplateId" TEXT;

-- AlterTable
ALTER TABLE "public"."organizations" ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "footerText" TEXT,
ADD COLUMN     "headerTitle" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "secondaryColor" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "parentUserId" TEXT;

-- CreateTable
CREATE TABLE "public"."sub_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "managedByUserId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "maxAssessments" INTEGER,
    "maxUsers" INTEGER NOT NULL DEFAULT 1,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_reports" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "riskLevel" "public"."RiskLevel" NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedByUserId" TEXT NOT NULL,
    "reportOptions" JSONB NOT NULL,
    "pdfPath" TEXT,
    "pdfSize" INTEGER,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ai_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assessment_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "disclaimer" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."domain_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,
    "resources" JSONB,
    "scoringConfig" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assessment_template_domains" (
    "id" TEXT NOT NULL,
    "assessmentTemplateId" TEXT NOT NULL,
    "domainTemplateId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "assessment_template_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sub_accounts_userId_key" ON "public"."sub_accounts"("userId");

-- CreateIndex
CREATE INDEX "sub_accounts_managedByUserId_idx" ON "public"."sub_accounts"("managedByUserId");

-- CreateIndex
CREATE INDEX "sub_accounts_organizationId_idx" ON "public"."sub_accounts"("organizationId");

-- CreateIndex
CREATE INDEX "sub_accounts_isActive_idx" ON "public"."sub_accounts"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ai_reports_assessmentId_key" ON "public"."ai_reports"("assessmentId");

-- CreateIndex
CREATE INDEX "ai_reports_assessmentId_idx" ON "public"."ai_reports"("assessmentId");

-- CreateIndex
CREATE INDEX "ai_reports_generatedByUserId_idx" ON "public"."ai_reports"("generatedByUserId");

-- CreateIndex
CREATE INDEX "ai_reports_generatedAt_idx" ON "public"."ai_reports"("generatedAt");

-- CreateIndex
CREATE INDEX "assessment_templates_createdById_idx" ON "public"."assessment_templates"("createdById");

-- CreateIndex
CREATE INDEX "assessment_templates_isPublished_idx" ON "public"."assessment_templates"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "domain_templates_slug_key" ON "public"."domain_templates"("slug");

-- CreateIndex
CREATE INDEX "domain_templates_createdById_idx" ON "public"."domain_templates"("createdById");

-- CreateIndex
CREATE INDEX "domain_templates_slug_idx" ON "public"."domain_templates"("slug");

-- CreateIndex
CREATE INDEX "assessment_template_domains_assessmentTemplateId_idx" ON "public"."assessment_template_domains"("assessmentTemplateId");

-- CreateIndex
CREATE INDEX "assessment_template_domains_domainTemplateId_idx" ON "public"."assessment_template_domains"("domainTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_template_domains_assessmentTemplateId_domainTemp_key" ON "public"."assessment_template_domains"("assessmentTemplateId", "domainTemplateId");

-- CreateIndex
CREATE INDEX "assessments_assessmentTemplateId_idx" ON "public"."assessments"("assessmentTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_customDomain_key" ON "public"."organizations"("customDomain");

-- CreateIndex
CREATE INDEX "users_parentUserId_idx" ON "public"."users"("parentUserId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_accounts" ADD CONSTRAINT "sub_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_accounts" ADD CONSTRAINT "sub_accounts_managedByUserId_fkey" FOREIGN KEY ("managedByUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sub_accounts" ADD CONSTRAINT "sub_accounts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessments" ADD CONSTRAINT "assessments_assessmentTemplateId_fkey" FOREIGN KEY ("assessmentTemplateId") REFERENCES "public"."assessment_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_reports" ADD CONSTRAINT "ai_reports_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_reports" ADD CONSTRAINT "ai_reports_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessment_templates" ADD CONSTRAINT "assessment_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."domain_templates" ADD CONSTRAINT "domain_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessment_template_domains" ADD CONSTRAINT "assessment_template_domains_assessmentTemplateId_fkey" FOREIGN KEY ("assessmentTemplateId") REFERENCES "public"."assessment_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessment_template_domains" ADD CONSTRAINT "assessment_template_domains_domainTemplateId_fkey" FOREIGN KEY ("domainTemplateId") REFERENCES "public"."domain_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
