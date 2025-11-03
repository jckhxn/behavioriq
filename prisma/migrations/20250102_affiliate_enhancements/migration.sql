-- Migration: Enhance affiliate system with preferences, notifications, and detailed payout tracking
-- Created: 2025-01-02

-- Create AffiliatePayoutPreferences table
CREATE TABLE "AffiliatePayoutPreferences" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "minPayoutThresholdCents" INTEGER NOT NULL DEFAULT 5000,
    "payoutFrequency" TEXT NOT NULL DEFAULT 'auto',
    "autoPayoutEnabled" BOOLEAN NOT NULL DEFAULT true,
    "payoutDayOfMonth" INTEGER,
    "payoutDayOfWeek" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliatePayoutPreferences_pkey" PRIMARY KEY ("id")
);

-- Create AffiliateNotificationPreferences table
CREATE TABLE "AffiliateNotificationPreferences" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "emailOnPayout" BOOLEAN NOT NULL DEFAULT true,
    "emailOnCommissionEarned" BOOLEAN NOT NULL DEFAULT true,
    "emailOnCommissionPayable" BOOLEAN NOT NULL DEFAULT true,
    "emailWeeklySummary" BOOLEAN NOT NULL DEFAULT false,
    "emailMonthlySummary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateNotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- Add new columns to AffiliatePayout
ALTER TABLE "AffiliatePayout" ADD COLUMN "payoutMethod" TEXT DEFAULT 'stripe_connect';
ALTER TABLE "AffiliatePayout" ADD COLUMN "estimatedArrivalDate" TIMESTAMP(3);
ALTER TABLE "AffiliatePayout" ADD COLUMN "actualArrivalDate" TIMESTAMP(3);
ALTER TABLE "AffiliatePayout" ADD COLUMN "feesCents" INTEGER DEFAULT 0;
ALTER TABLE "AffiliatePayout" ADD COLUMN "netAmountCents" INTEGER;

-- Add new columns to AffiliateReferrer
ALTER TABLE "AffiliateReferrer" ADD COLUMN "lastPayoutDate" TIMESTAMP(3);
ALTER TABLE "AffiliateReferrer" ADD COLUMN "lifetimeEarningsCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AffiliateReferrer" ADD COLUMN "lifetimePaidOutCents" INTEGER NOT NULL DEFAULT 0;

-- Create unique indexes
CREATE UNIQUE INDEX "AffiliatePayoutPreferences_referrerId_key" ON "AffiliatePayoutPreferences"("referrerId");
CREATE UNIQUE INDEX "AffiliateNotificationPreferences_referrerId_key" ON "AffiliateNotificationPreferences"("referrerId");

-- Create indexes for performance
CREATE INDEX "AffiliatePayoutPreferences_referrerId_idx" ON "AffiliatePayoutPreferences"("referrerId");
CREATE INDEX "AffiliateNotificationPreferences_referrerId_idx" ON "AffiliateNotificationPreferences"("referrerId");
CREATE INDEX "AffiliatePayout_estimatedArrivalDate_idx" ON "AffiliatePayout"("estimatedArrivalDate");
CREATE INDEX "AffiliateCommission_holdUntil_idx" ON "AffiliateCommission"("holdUntil");
CREATE INDEX "AffiliateCommission_referrerId_status_idx" ON "AffiliateCommission"("referrerId", "status");

-- Add foreign key constraints
ALTER TABLE "AffiliatePayoutPreferences" ADD CONSTRAINT "AffiliatePayoutPreferences_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "AffiliateReferrer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AffiliateNotificationPreferences" ADD CONSTRAINT "AffiliateNotificationPreferences_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "AffiliateReferrer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add check constraints
ALTER TABLE "AffiliatePayoutPreferences" ADD CONSTRAINT "AffiliatePayoutPreferences_minPayoutThresholdCents_check" CHECK ("minPayoutThresholdCents" >= 5000 AND "minPayoutThresholdCents" <= 50000);
ALTER TABLE "AffiliatePayoutPreferences" ADD CONSTRAINT "AffiliatePayoutPreferences_payoutDayOfMonth_check" CHECK ("payoutDayOfMonth" IS NULL OR ("payoutDayOfMonth" >= 1 AND "payoutDayOfMonth" <= 28));
ALTER TABLE "AffiliatePayoutPreferences" ADD CONSTRAINT "AffiliatePayoutPreferences_payoutDayOfWeek_check" CHECK ("payoutDayOfWeek" IS NULL OR ("payoutDayOfWeek" >= 0 AND "payoutDayOfWeek" <= 6));
ALTER TABLE "AffiliatePayoutPreferences" ADD CONSTRAINT "AffiliatePayoutPreferences_payoutFrequency_check" CHECK ("payoutFrequency" IN ('auto', 'daily', 'weekly', 'monthly'));

-- Backfill netAmountCents for existing payouts
UPDATE "AffiliatePayout" SET "netAmountCents" = "amountCents" - COALESCE("feesCents", 0) WHERE "netAmountCents" IS NULL;
