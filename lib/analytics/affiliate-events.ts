/**
 * Affiliate Event Tracking
 * Track all affiliate-related events for analytics
 */

import { prisma } from "@/lib/db/prisma";

export type AffiliateEventType =
  | "referral.click"
  | "referral.signup"
  | "referral.order"
  | "referral.commission_pending"
  | "referral.commission_payable"
  | "referral.commission_paid"
  | "referral.commission_void"
  | "referral.commission_clawed_back"
  | "referral.payout_requested"
  | "referral.payout_sent"
  | "referral.payout_failed"
  | "referral.flag_household"
  | "referral.flag_velocity"
  | "referral.flag_fraud";

export interface AffiliateEventData {
  type: AffiliateEventType;
  referrerId?: string;
  referredUserId?: string;
  refCode?: string;
  amountCents?: number;
  metadata?: Record<string, any>;
}

/**
 * Track affiliate events for analytics
 * Can be extended to send to external analytics service (GA4, Mixpanel, etc)
 */
export async function trackAffiliateEvent(event: AffiliateEventData) {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[AffiliateEvent] ${event.type}`, {
        referrerId: event.referrerId,
        refCode: event.refCode,
        amountCents: event.amountCents,
        metadata: event.metadata,
      });
    }

    // TODO: Send to external analytics service
    // - Google Analytics 4
    // - Mixpanel
    // - Amplitude
    // - Custom events table in database

    // Example: Send to GA4
    // await sendToGoogleAnalytics({
    //   event_name: event.type,
    //   event_params: {
    //     referrer_id: event.referrerId,
    //     ref_code: event.refCode,
    //     amount_cents: event.amountCents,
    //     ...event.metadata,
    //   },
    // });
  } catch (error) {
    console.error("[AffiliateEvent] Error tracking event:", error);
    // Don't throw - silently fail to avoid blocking operations
  }
}

/**
 * Track click event
 */
export function trackClick(refCode: string, metadata?: Record<string, any>) {
  return trackAffiliateEvent({
    type: "referral.click",
    refCode,
    metadata,
  });
}

/**
 * Track signup/attribution event
 */
export function trackSignup(
  refCode: string,
  referredUserId: string,
  metadata?: Record<string, any>
) {
  return trackAffiliateEvent({
    type: "referral.signup",
    refCode,
    referredUserId,
    metadata,
  });
}

/**
 * Track purchase/order event
 */
export function trackOrder(
  refCode: string,
  referredUserId: string,
  amountCents: number,
  metadata?: Record<string, any>
) {
  return trackAffiliateEvent({
    type: "referral.order",
    refCode,
    referredUserId,
    amountCents,
    metadata,
  });
}

/**
 * Track commission state changes
 */
export function trackCommissionStateChange(
  referrerId: string,
  refCode: string,
  fromStatus: string,
  toStatus: string,
  amountCents: number,
  metadata?: Record<string, any>
) {
  const eventMap: Record<string, AffiliateEventType> = {
    pending: "referral.commission_pending",
    payable: "referral.commission_payable",
    paid: "referral.commission_paid",
    void: "referral.commission_void",
    clawed_back: "referral.commission_clawed_back",
  };

  return trackAffiliateEvent({
    type: eventMap[toStatus] || "referral.commission_pending",
    referrerId,
    refCode,
    amountCents,
    metadata: {
      ...metadata,
      fromStatus,
      toStatus,
    },
  });
}

/**
 * Track payout events
 */
export function trackPayoutRequested(
  referrerId: string,
  refCode: string,
  amountCents: number,
  metadata?: Record<string, any>
) {
  return trackAffiliateEvent({
    type: "referral.payout_requested",
    referrerId,
    refCode,
    amountCents,
    metadata,
  });
}

export function trackPayoutSent(
  referrerId: string,
  refCode: string,
  amountCents: number,
  transferId?: string,
  metadata?: Record<string, any>
) {
  return trackAffiliateEvent({
    type: "referral.payout_sent",
    referrerId,
    refCode,
    amountCents,
    metadata: { ...metadata, transferId },
  });
}

export function trackPayoutFailed(
  referrerId: string,
  refCode: string,
  amountCents: number,
  error?: string,
  metadata?: Record<string, any>
) {
  return trackAffiliateEvent({
    type: "referral.payout_failed",
    referrerId,
    refCode,
    amountCents,
    metadata: { ...metadata, error },
  });
}

/**
 * Track fraud flags
 */
export function trackHouseholdFlag(
  referrerId: string,
  referredUserId: string,
  refCode: string,
  matchingSignals: string[],
  metadata?: Record<string, any>
) {
  return trackAffiliateEvent({
    type: "referral.flag_household",
    referrerId,
    referredUserId,
    refCode,
    metadata: { ...metadata, matchingSignals },
  });
}

export function trackVelocityFlag(
  refCode: string,
  referredUserId?: string,
  metadata?: Record<string, any>
) {
  return trackAffiliateEvent({
    type: "referral.flag_velocity",
    refCode,
    referredUserId,
    metadata,
  });
}

export function trackFraudFlag(
  refCode: string,
  reason: string,
  metadata?: Record<string, any>
) {
  return trackAffiliateEvent({
    type: "referral.flag_fraud",
    refCode,
    metadata: { ...metadata, reason },
  });
}
