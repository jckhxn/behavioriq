-- DropIndex
DROP INDEX "public"."scores_assessmentId_domain_timestamp_key";

-- AlterTable
ALTER TABLE "public"."scores" ADD COLUMN     "domainName" TEXT,
ADD COLUMN     "domainTemplateId" TEXT,
ALTER COLUMN "domain" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "scores_domainTemplateId_idx" ON "public"."scores"("domainTemplateId");

-- AddForeignKey
ALTER TABLE "public"."scores" ADD CONSTRAINT "scores_domainTemplateId_fkey" FOREIGN KEY ("domainTemplateId") REFERENCES "public"."domain_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
