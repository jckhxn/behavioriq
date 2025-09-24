/*
  Warnings:

  - A unique constraint covering the columns `[shortId]` on the table `assessments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."assessments" ADD COLUMN     "shortId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "assessments_shortId_key" ON "public"."assessments"("shortId");

-- CreateIndex
CREATE INDEX "assessments_shortId_idx" ON "public"."assessments"("shortId");
