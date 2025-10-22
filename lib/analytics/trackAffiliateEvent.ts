// Analytics/event tracking utility for affiliate and other events
import { prisma } from "../db/prisma";

export type AffiliateEventType =
  | "referral.click"
  | "referral.signup"
  | "referral.order"
  | "referral.commission_status_changed"
  | "referral.payout";

interface TrackAffiliateEventOptions {
  userId?: string;
  event: AffiliateEventType;
  metadata?: Record<string, any>;
}

/**
 * Track an affiliate-related event for analytics and compliance.
 * Persists to TelemetryEvent table for audit and reporting.
 */
export async function trackAffiliateEvent({
  userId,
  event,
  metadata = {},
}: TrackAffiliateEventOptions) {
  await prisma.telemetryEvent.create({
    data: {
      userId,
      event,
      metadata,
    },
  });
}
