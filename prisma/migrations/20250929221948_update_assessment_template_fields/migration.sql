/*
  Warnings:

  - You are about to drop the column `disclaimer` on the `assessment_templates` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `assessment_templates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `assessment_templates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `assessment_templates` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."assessment_templates_isPublished_idx";

-- AlterTable
ALTER TABLE "public"."assessment_templates" DROP COLUMN "disclaimer",
DROP COLUMN "isPublished",
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "assessment_templates_slug_key" ON "public"."assessment_templates"("slug");

-- CreateIndex
CREATE INDEX "assessment_templates_isActive_idx" ON "public"."assessment_templates"("isActive");

-- CreateIndex
CREATE INDEX "assessment_templates_slug_idx" ON "public"."assessment_templates"("slug");
