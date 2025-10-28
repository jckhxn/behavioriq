/**
 * Google Analytics 4 Service
 * Integrates GA4 event tracking with our telemetry system
 */

import { trackTelemetry } from "@/lib/utils/telemetry";

interface GA4EventParams {
  [key: string]: string | number | boolean | string[] | number[] | null;
}

interface AnalyticsEvent {
  name: string;
  params?: GA4EventParams;
}

/**
 * Send event to Google Analytics 4
 * Works client-side via gtag global
 */
export function trackGA4Event(eventName: string, params?: GA4EventParams) {
  try {
    // Client-side GA4 tracking via gtag
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, params || {});
    }

    // Also track in our database for redundancy and analysis
    trackTelemetry(`ga4_${eventName}`, {
      params,
      source: "ga4",
    });
  } catch (error) {
    console.error("Failed to track GA4 event:", error);
  }
}

/**
 * Track user signup/registration
 */
export function trackSignup(params?: {
  method?: string;
  email?: string;
  [key: string]: any;
}) {
  trackGA4Event("sign_up", {
    method: params?.method || "email",
    ...params,
  });
}

/**
 * Track user login
 */
export function trackLogin(params?: {
  method?: string;
  email?: string;
  [key: string]: any;
}) {
  trackGA4Event("login", {
    method: params?.method || "email",
    ...params,
  });
}

/**
 * Track assessment start
 */
export function trackAssessmentStart(params: {
  assessmentId: string;
  childName?: string;
  domain?: string;
  [key: string]: any;
}) {
  const eventParams: GA4EventParams = {
    assessment_id: params.assessmentId,
  };
  if (params.childName) eventParams.child_name = params.childName;
  if (params.domain) eventParams.domain = params.domain;
  trackGA4Event("assessment_start", eventParams);
}

/**
 * Track assessment completion
 */
export function trackAssessmentComplete(params: {
  assessmentId: string;
  duration?: number;
  score?: number;
  domain?: string;
  [key: string]: any;
}) {
  trackGA4Event("assessment_complete", {
    assessment_id: params.assessmentId,
    duration_seconds: params.duration,
    score: params.score,
    domain: params.domain,
    ...params,
  });
}

/**
 * Track plan upgrade
 */
export function trackUpgrade(params: {
  planName: string;
  planPrice?: number;
  currency?: string;
  source?: string;
  [key: string]: any;
}) {
  trackGA4Event("upgrade", {
    plan_name: params.planName,
    value: params.planPrice,
    currency: params.currency || "USD",
    source: params.source,
    ...params,
  });
}

/**
 * Track purchase (one-time)
 */
export function trackPurchase(params: {
  itemName: string;
  price: number;
  currency?: string;
  quantity?: number;
  [key: string]: any;
}) {
  trackGA4Event("purchase", {
    item_name: params.itemName,
    value: params.price,
    currency: params.currency || "USD",
    quantity: params.quantity || 1,
    ...params,
  });
}

/**
 * Track subscription start (via Stripe)
 */
export function trackSubscriptionStart(params: {
  subscriptionId: string;
  planName: string;
  planPrice: number;
  currency?: string;
  [key: string]: any;
}) {
  trackGA4Event("subscription_start", {
    subscription_id: params.subscriptionId,
    plan_name: params.planName,
    value: params.planPrice,
    currency: params.currency || "USD",
    ...params,
  });
}

/**
 * Track subscription cancellation
 */
export function trackSubscriptionCancel(params: {
  subscriptionId: string;
  planName: string;
  reason?: string;
  [key: string]: any;
}) {
  trackGA4Event("subscription_cancel", {
    subscription_id: params.subscriptionId,
    plan_name: params.planName,
    reason: params.reason,
    ...params,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(params: {
  featureName: string;
  category?: string;
  [key: string]: any;
}) {
  trackGA4Event("feature_usage", {
    feature_name: params.featureName,
    category: params.category,
    ...params,
  });
}

/**
 * Track page view (manual, useful for SPAs)
 */
export function trackPageView(params: {
  pageTitle?: string;
  pagePath?: string;
  [key: string]: any;
}) {
  trackGA4Event("page_view", {
    page_title: params.pageTitle,
    page_path: params.pagePath,
    ...params,
  });
}

/**
 * Track error/exception
 */
export function trackException(params: {
  description: string;
  fatal?: boolean;
  [key: string]: any;
}) {
  trackGA4Event("exception", {
    description: params.description,
    fatal: params.fatal || false,
    ...params,
  });
}

/**
 * Track user engagement
 */
export function trackEngagement(params: {
  engagementType: string;
  duration?: number;
  [key: string]: any;
}) {
  trackGA4Event("engagement", {
    engagement_type: params.engagementType,
    duration_seconds: params.duration,
    ...params,
  });
}

/**
 * Track referral
 */
export function trackReferral(params: {
  referralCode?: string;
  source?: string;
  [key: string]: any;
}) {
  trackGA4Event("referral", {
    referral_code: params.referralCode,
    source: params.source,
    ...params,
  });
}

/**
 * Initialize GA4 in layout (call from client-side component)
 * This function helps ensure GA4 is properly initialized
 */
export function initializeGA4(measurementId?: string) {
  const id = measurementId || process.env.NEXT_PUBLIC_GA4_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  if (!id) {
    console.warn("GA4 measurement ID not configured");
    return;
  }

  try {
    // This assumes gtag script is loaded in the HTML head
    // The actual gtag initialization happens in the script tag in layout.tsx
    if (typeof window !== "undefined") {
      // Verify gtag is available
      if ((window as any).gtag) {
        // Set user properties if available
        const userId = localStorage.getItem("userId");
        if (userId) {
          (window as any).gtag("config", id, {
            user_id: userId,
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to initialize GA4:", error);
  }
}

export default {
  trackGA4Event,
  trackSignup,
  trackLogin,
  trackAssessmentStart,
  trackAssessmentComplete,
  trackUpgrade,
  trackPurchase,
  trackSubscriptionStart,
  trackSubscriptionCancel,
  trackFeatureUsage,
  trackPageView,
  trackException,
  trackEngagement,
  trackReferral,
  initializeGA4,
};
