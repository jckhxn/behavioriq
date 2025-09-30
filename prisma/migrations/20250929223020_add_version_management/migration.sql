-- AlterTable
ALTER TABLE "public"."assessment_templates" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."domain_templates" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."assessment_template_versions" (
    "id" TEXT NOT NULL,
    "assessmentTemplateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL,
    "domainSnapshot" JSONB NOT NULL,
    "changeDescription" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."domain_template_versions" (
    "id" TEXT NOT NULL,
    "domainTemplateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,
    "resources" JSONB,
    "scoringConfig" JSONB,
    "changeDescription" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_template_versions_assessmentTemplateId_idx" ON "public"."assessment_template_versions"("assessmentTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_template_versions_assessmentTemplateId_version_key" ON "public"."assessment_template_versions"("assessmentTemplateId", "version");

-- CreateIndex
CREATE INDEX "domain_template_versions_domainTemplateId_idx" ON "public"."domain_template_versions"("domainTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "domain_template_versions_domainTemplateId_version_key" ON "public"."domain_template_versions"("domainTemplateId", "version");

-- AddForeignKey
ALTER TABLE "public"."assessment_template_versions" ADD CONSTRAINT "assessment_template_versions_assessmentTemplateId_fkey" FOREIGN KEY ("assessmentTemplateId") REFERENCES "public"."assessment_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessment_template_versions" ADD CONSTRAINT "assessment_template_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."domain_template_versions" ADD CONSTRAINT "domain_template_versions_domainTemplateId_fkey" FOREIGN KEY ("domainTemplateId") REFERENCES "public"."domain_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."domain_template_versions" ADD CONSTRAINT "domain_template_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
