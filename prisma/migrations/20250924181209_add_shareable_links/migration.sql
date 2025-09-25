-- CreateEnum
CREATE TYPE "public"."ShareLinkPrivacy" AS ENUM ('PUBLIC', 'PRIVATE', 'PASSWORD_PROTECTED');

-- CreateTable
CREATE TABLE "public"."shareable_links" (
    "id" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "privacy" "public"."ShareLinkPrivacy" NOT NULL DEFAULT 'PRIVATE',
    "password" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shareable_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shareable_links_shareCode_key" ON "public"."shareable_links"("shareCode");

-- CreateIndex
CREATE INDEX "shareable_links_shareCode_idx" ON "public"."shareable_links"("shareCode");

-- CreateIndex
CREATE INDEX "shareable_links_assessmentId_idx" ON "public"."shareable_links"("assessmentId");

-- CreateIndex
CREATE INDEX "shareable_links_createdById_idx" ON "public"."shareable_links"("createdById");

-- CreateIndex
CREATE INDEX "shareable_links_isActive_idx" ON "public"."shareable_links"("isActive");

-- AddForeignKey
ALTER TABLE "public"."shareable_links" ADD CONSTRAINT "shareable_links_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shareable_links" ADD CONSTRAINT "shareable_links_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
