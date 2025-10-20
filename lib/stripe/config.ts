import Stripe from "stripe";
import { BUSINESS_CONFIG } from "@/lib/config/business-config";
import {
  PRICING,
  PRICING_DISPLAY_PLANS,
  SUBSCRIPTION_PLANS as DASHBOARD_SUBSCRIPTION_PLANS,
} from "@/lib/config/pricing";
import {
  getSingleAssessmentPriceId,
  getStripePriceIdForPlan,
} from "@/lib/config/stripe-price-ids";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

const singleAssessmentPlan = PRICING_DISPLAY_PLANS.find(
  (plan) => plan.id === "SINGLE"
) ?? {
  name: "Single Assessment",
  description: "One comprehensive assessment with AI-powered insights.",
  credits: "1 assessment credit",
};

export const PRICING_PLANS = {
  SINGLE: {
    name: singleAssessmentPlan.name,
    description: singleAssessmentPlan.description,
    price: PRICING.SINGLE_ASSESSMENT,
    priceId: getSingleAssessmentPriceId(),
    features: [
      singleAssessmentPlan.credits,
      "Professional-grade PDF download",
      "Personalized recommendations",
      "Resource library access",
    ],
    maxAssessments: 1,
  },
  BASIC: {
    name: BUSINESS_CONFIG.PRICING.CORE_OFFER.name,
    description: BUSINESS_CONFIG.PRICING.CORE_OFFER.description,
    price: BUSINESS_CONFIG.PRICING.CORE_OFFER.amount,
    priceId: getSingleAssessmentPriceId(),
    features: BUSINESS_CONFIG.FEATURES.CORE_OFFER,
    maxAssessments: 1,
  },
  PREMIUM: {
    name: "Premium Plan",
    description: "Multiple assessments with enhanced features",
    price: 4999, // $49.99 in cents
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      "Up to 5 assessments",
      "AI-powered behavioral analysis",
      "Detailed PDF reports",
      "Share results with professionals",
      "Priority email support",
      "Assessment history",
    ],
    maxAssessments: 5,
  },
  UNLIMITED: {
    name: "Unlimited Plan",
    description: "Unlimited assessments for families and professionals",
    price: 9999, // $99.99 in cents
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID,
    features: [
      "Unlimited assessments",
      "AI-powered behavioral analysis",
      "Detailed PDF reports",
      "Share results with professionals",
      "Priority support",
      "Assessment history",
      "Custom report branding",
      "API access",
    ],
    maxAssessments: -1, // -1 means unlimited
  },
} as const;

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: BUSINESS_CONFIG.PRICING.MEMBERSHIP.name,
    description: BUSINESS_CONFIG.PRICING.MEMBERSHIP.description,
    price: BUSINESS_CONFIG.PRICING.MEMBERSHIP.amount,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
    interval: "month",
    features: BUSINESS_CONFIG.FEATURES.MEMBERSHIP,
  },
  YEARLY: {
    name: "Yearly Subscription",
    description: "Unlimited access for $199/year (2 months free!)",
    price: 19900, // $199 in cents
    priceId: process.env.STRIPE_YEARLY_PRICE_ID,
    interval: "year",
    features: [
      "Unlimited assessments",
      "AI-powered behavioral analysis",
      "Detailed PDF reports",
      "Share results with professionals",
      "Priority support",
      "Assessment history",
      "2 months free compared to monthly",
    ],
  },
  // Alias for YEARLY to support legacy code
  ANNUAL: {
    name: "Annual Subscription",
    description: "Unlimited access for $297/year (save $58/year!)",
    price: 29700, // $297 in cents
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID,
    interval: "year",
    features: [
      "Unlimited assessments",
      "AI-powered behavioral analysis",
      "Detailed PDF reports",
      "Share results with professionals",
      "Priority support",
      "Assessment history",
      "Save $58/year compared to monthly",
    ],
  },
  CORE_MONTHLY: {
    name: DASHBOARD_SUBSCRIPTION_PLANS.CORE_MONTHLY.label,
    description: DASHBOARD_SUBSCRIPTION_PLANS.CORE_MONTHLY.creditRolloverNote,
    price: DASHBOARD_SUBSCRIPTION_PLANS.CORE_MONTHLY.priceCents,
    priceId: getStripePriceIdForPlan("CORE_MONTHLY"),
    interval: DASHBOARD_SUBSCRIPTION_PLANS.CORE_MONTHLY.billingInterval,
    features: DASHBOARD_SUBSCRIPTION_PLANS.CORE_MONTHLY.features,
  },
  CORE_ANNUAL: {
    name: DASHBOARD_SUBSCRIPTION_PLANS.CORE_ANNUAL.label,
    description: DASHBOARD_SUBSCRIPTION_PLANS.CORE_ANNUAL.creditRolloverNote,
    price: DASHBOARD_SUBSCRIPTION_PLANS.CORE_ANNUAL.priceCents,
    priceId: getStripePriceIdForPlan("CORE_ANNUAL"),
    interval: DASHBOARD_SUBSCRIPTION_PLANS.CORE_ANNUAL.billingInterval,
    features: DASHBOARD_SUBSCRIPTION_PLANS.CORE_ANNUAL.features,
  },
  FAMILY_MONTHLY: {
    name: DASHBOARD_SUBSCRIPTION_PLANS.FAMILY_MONTHLY.label,
    description: DASHBOARD_SUBSCRIPTION_PLANS.FAMILY_MONTHLY.creditRolloverNote,
    price: DASHBOARD_SUBSCRIPTION_PLANS.FAMILY_MONTHLY.priceCents,
    priceId: getStripePriceIdForPlan("FAMILY_MONTHLY"),
    interval: DASHBOARD_SUBSCRIPTION_PLANS.FAMILY_MONTHLY.billingInterval,
    features: DASHBOARD_SUBSCRIPTION_PLANS.FAMILY_MONTHLY.features,
  },
  FAMILY_ANNUAL: {
    name: DASHBOARD_SUBSCRIPTION_PLANS.FAMILY_ANNUAL.label,
    description: DASHBOARD_SUBSCRIPTION_PLANS.FAMILY_ANNUAL.creditRolloverNote,
    price: DASHBOARD_SUBSCRIPTION_PLANS.FAMILY_ANNUAL.priceCents,
    priceId: getStripePriceIdForPlan("FAMILY_ANNUAL"),
    interval: DASHBOARD_SUBSCRIPTION_PLANS.FAMILY_ANNUAL.billingInterval,
    features: DASHBOARD_SUBSCRIPTION_PLANS.FAMILY_ANNUAL.features,
  },
} as const;

export const ADD_ON_PLANS = {
  CONVERSATIONAL_AI: {
    name: BUSINESS_CONFIG.PRICING.CONVERSATIONAL_AI.name,
    description: BUSINESS_CONFIG.PRICING.CONVERSATIONAL_AI.description,
    price: BUSINESS_CONFIG.PRICING.CONVERSATIONAL_AI.amount,
    priceId: process.env.STRIPE_CONVERSATIONAL_AI_PRICE_ID,
    features: BUSINESS_CONFIG.FEATURES.CONVERSATIONAL_AI,
    sessionBased: true,
  },
} as const;

export type PricingPlan = keyof typeof PRICING_PLANS;
export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
export type AddOnPlan = keyof typeof ADD_ON_PLANS;
