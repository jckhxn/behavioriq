CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

CREATE TYPE "public"."AssessmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "public"."ChatSessionType" AS ENUM ('ASSESSMENT', 'KNOWLEDGE');

-- CreateEnum
CREATE TYPE "public"."MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "public"."AssessmentDomain" AS ENUM ('ANTISOCIAL', 'VIOLENCE', 'ATTENTION', 'EMOTIONAL', 'CONDUCT');

-- CreateEnum
CREATE TYPE "public"."DocumentCategory" AS ENUM ('POLICY', 'PROCEDURE', 'GUIDELINE', 'MANUAL', 'ASSESSMENT_TOOL', 'REFERENCE', 'OTHER');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "category" "public"."DocumentCategory" NOT NULL DEFAULT 'OTHER',
    "content" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_chunks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "public"."DocumentCategory" NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "embedding" vector(1536),
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "status" "public"."AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "public"."ChatSessionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT,
    "sessionId" TEXT,
    "role" "public"."MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "sources" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scores" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "domain" "public"."AssessmentDomain" NOT NULL,
    "rawScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" "public"."RiskLevel" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "public"."documents"("userId");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "public"."documents"("category");

-- CreateIndex
CREATE INDEX "document_chunks_documentId_idx" ON "public"."document_chunks"("documentId");

-- CreateIndex
CREATE INDEX "document_chunks_userId_idx" ON "public"."document_chunks"("userId");

-- CreateIndex
CREATE INDEX "assessments_userId_idx" ON "public"."assessments"("userId");

-- CreateIndex
CREATE INDEX "assessments_status_idx" ON "public"."assessments"("status");

-- CreateIndex
CREATE INDEX "chat_sessions_userId_idx" ON "public"."chat_sessions"("userId");

-- CreateIndex
CREATE INDEX "chat_sessions_type_idx" ON "public"."chat_sessions"("type");

-- CreateIndex
CREATE INDEX "chat_messages_assessmentId_idx" ON "public"."chat_messages"("assessmentId");

-- CreateIndex
CREATE INDEX "chat_messages_sessionId_idx" ON "public"."chat_messages"("sessionId");

-- CreateIndex
CREATE INDEX "scores_assessmentId_idx" ON "public"."scores"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "scores_assessmentId_domain_timestamp_key" ON "public"."scores"("assessmentId", "domain", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_chunks" ADD CONSTRAINT "document_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessments" ADD CONSTRAINT "assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_sessions" ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scores" ADD CONSTRAINT "scores_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
