-- CreateEnum: Email template types
CREATE TYPE "EmailTemplateType" AS ENUM (
  'ASSESSMENT_REPORT',
  'LICENSE_NOTIFICATION',
  'LICENSE_RENEWED',
  'WELCOME',
  'PASSWORD_RESET',
  'MAGIC_LINK',
  'EMAIL_VERIFICATION',
  'EMAIL_CHANGE',
  'AFFILIATE_WELCOME',
  'AFFILIATE_COMMISSION',
  'AFFILIATE_PAYOUT',
  'AFFILIATE_FRAUD_ALERT',
  'SYSTEM_NOTIFICATION',
  'GENERIC'
);

-- Drop existing EmailTemplate table if it exists
DROP TABLE IF EXISTS "EmailTemplate" CASCADE;

-- Create enhanced EmailTemplate table
CREATE TABLE "EmailTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "type" "EmailTemplateType" NOT NULL,
  "category" TEXT,
  "subject" TEXT NOT NULL,
  "preheader" TEXT,
  "html" TEXT NOT NULL,
  "plainText" TEXT,
  "variables" JSONB DEFAULT '{}',
  "metadata" JSONB DEFAULT '{}',
  "version" INTEGER NOT NULL DEFAULT 1,
  "parentId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- Create EmailTemplateVersion table for version history
CREATE TABLE "EmailTemplateVersion" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "preheader" TEXT,
  "html" TEXT NOT NULL,
  "plainText" TEXT,
  "variables" JSONB DEFAULT '{}',
  "metadata" JSONB DEFAULT '{}',
  "changeDescription" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmailTemplateVersion_pkey" PRIMARY KEY ("id")
);

-- Add templateId and templateVersion to EmailLog
ALTER TABLE "email_logs" ADD COLUMN IF NOT EXISTS "templateId" TEXT;
ALTER TABLE "email_logs" ADD COLUMN IF NOT EXISTS "templateVersion" INTEGER;

-- Create indexes
CREATE UNIQUE INDEX "EmailTemplate_slug_key" ON "EmailTemplate"("slug");
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");
CREATE INDEX "EmailTemplate_type_idx" ON "EmailTemplate"("type");
CREATE INDEX "EmailTemplate_category_idx" ON "EmailTemplate"("category");
CREATE INDEX "EmailTemplate_isActive_idx" ON "EmailTemplate"("isActive");
CREATE INDEX "EmailTemplate_createdById_idx" ON "EmailTemplate"("createdById");

CREATE UNIQUE INDEX "EmailTemplateVersion_templateId_version_key" ON "EmailTemplateVersion"("templateId", "version");
CREATE INDEX "EmailTemplateVersion_templateId_idx" ON "EmailTemplateVersion"("templateId");
CREATE INDEX "EmailTemplateVersion_createdAt_idx" ON "EmailTemplateVersion"("createdAt");

CREATE INDEX "email_logs_templateId_idx" ON "email_logs"("templateId");

-- Add foreign keys
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailTemplateVersion" ADD CONSTRAINT "EmailTemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailTemplateVersion" ADD CONSTRAINT "EmailTemplateVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
