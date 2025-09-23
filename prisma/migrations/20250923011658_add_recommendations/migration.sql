-- CreateTable
CREATE TABLE "public"."recommendations" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isBookmarked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recommendations_userId_idx" ON "public"."recommendations"("userId");

-- CreateIndex
CREATE INDEX "recommendations_assessmentId_idx" ON "public"."recommendations"("assessmentId");

-- CreateIndex
CREATE INDEX "recommendations_isBookmarked_idx" ON "public"."recommendations"("isBookmarked");

-- AddForeignKey
ALTER TABLE "public"."recommendations" ADD CONSTRAINT "recommendations_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recommendations" ADD CONSTRAINT "recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
