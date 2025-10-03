-- CreateTable
CREATE TABLE "public"."login_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_tokens_token_key" ON "public"."login_tokens"("token");

-- CreateIndex
CREATE INDEX "login_tokens_token_idx" ON "public"."login_tokens"("token");

-- CreateIndex
CREATE INDEX "login_tokens_userId_idx" ON "public"."login_tokens"("userId");

-- CreateIndex
CREATE INDEX "login_tokens_expiresAt_idx" ON "public"."login_tokens"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."login_tokens" ADD CONSTRAINT "login_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
