import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

export const PRICING_PLANS = {
  BASIC: {
    name: "Basic Plan",
    description: "Single assessment with AI analysis",
    price: 2999, // $29.99 in cents
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: [
      "Single comprehensive assessment",
      "AI-powered behavioral analysis",
      "Detailed PDF report",
      "Email support",
    ],
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
    name: "Monthly Subscription",
    description: "Unlimited access for $19.99/month",
    price: 1999, // $19.99 in cents
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
    interval: "month",
    features: [
      "Unlimited assessments",
      "AI-powered behavioral analysis",
      "Detailed PDF reports",
      "Share results with professionals",
      "Priority support",
      "Assessment history",
    ],
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
} as const;

export type PricingPlan = keyof typeof PRICING_PLANS;
export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
