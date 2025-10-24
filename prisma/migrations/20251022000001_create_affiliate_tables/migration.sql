-- Create AffiliateReferrer table
CREATE TABLE IF NOT EXISTS "AffiliateReferrer" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "refCode" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'active',
  "stripeConnectAccountId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliateReferrer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create AffiliateClick table
CREATE TABLE IF NOT EXISTS "AffiliateClick" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "refCode" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "ip" TEXT,
  "ua" TEXT,
  "utm" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create AffiliateAttribution table
CREATE TABLE IF NOT EXISTS "AffiliateAttribution" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "refCode" TEXT NOT NULL,
  "prospectUserId" TEXT NOT NULL UNIQUE,
  "clickId" TEXT,
  "deviceId" TEXT,
  "ip" TEXT,
  "utm" JSONB,
  "model" TEXT NOT NULL DEFAULT 'last_non_direct',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create AffiliateCommission table
CREATE TABLE IF NOT EXISTS "AffiliateCommission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "refCode" TEXT NOT NULL,
  "referrerId" TEXT NOT NULL,
  "referredUserId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "voidReason" TEXT,
  "holdUntil" TIMESTAMP(3),
  "orderId" TEXT UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliateCommission_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "AffiliateReferrer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create AffiliatePayout table
CREATE TABLE IF NOT EXISTS "AffiliatePayout" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "referrerId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "provider" TEXT NOT NULL DEFAULT 'stripe_connect',
  "transferId" TEXT,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliatePayout_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "AffiliateReferrer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "AffiliateReferrer_status_idx" ON "AffiliateReferrer"("status");
CREATE INDEX IF NOT EXISTS "AffiliateClick_refCode_idx" ON "AffiliateClick"("refCode");
CREATE INDEX IF NOT EXISTS "AffiliateClick_sessionId_idx" ON "AffiliateClick"("sessionId");
CREATE INDEX IF NOT EXISTS "AffiliateClick_createdAt_idx" ON "AffiliateClick"("createdAt");
CREATE INDEX IF NOT EXISTS "AffiliateAttribution_refCode_idx" ON "AffiliateAttribution"("refCode");
CREATE INDEX IF NOT EXISTS "AffiliateAttribution_createdAt_idx" ON "AffiliateAttribution"("createdAt");
CREATE INDEX IF NOT EXISTS "AffiliateCommission_referrerId_idx" ON "AffiliateCommission"("referrerId");
CREATE INDEX IF NOT EXISTS "AffiliateCommission_status_idx" ON "AffiliateCommission"("status");
CREATE INDEX IF NOT EXISTS "AffiliateCommission_createdAt_idx" ON "AffiliateCommission"("createdAt");
CREATE INDEX IF NOT EXISTS "AffiliatePayout_referrerId_idx" ON "AffiliatePayout"("referrerId");
CREATE INDEX IF NOT EXISTS "AffiliatePayout_status_idx" ON "AffiliatePayout"("status");
CREATE INDEX IF NOT EXISTS "AffiliatePayout_createdAt_idx" ON "AffiliatePayout"("createdAt");
