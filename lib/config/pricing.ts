/**
 * Centralized pricing configuration
 * All amounts in cents for Stripe
 */
export const PRICING = {
  SINGLE_ASSESSMENT: 9700, // $97.00
  MONTHLY_SUBSCRIPTION: 5900, // $29.00
  ENHANCED_REPORT: 900, // $9.00
  ANNUAL_SUBSCRIPTION: 59700,
} as const;

export const ADD_ON_PRICING = {
  ASSESSMENT_CREDIT: 7700, // $77.00
  CONVERSATIONAL_AI: 900, // $9.00
} as const;

export const STRIPE_PRICE_IDS = {
  SINGLE_ASSESSMENT: process.env.STRIPE_BASIC_PRICE_ID!,
  MONTHLY_SUBSCRIPTION: process.env.STRIPE_MONTHLY_PRICE_ID!,
  ENHANCED_REPORT: process.env.STRIPE_CONVERSATIONAL_AI_PRICE_ID!,
  ANNUAL_SUBSCRIPTION: process.env.STRIPE_ANNUAL_PRICE_ID!,
} as const;

export type PricingTier = keyof typeof PRICING;

export type PricingPlanId = "BASIC" | "PLUS" | "FAMILY" | "PRO" | "ENTERPRISE";

export interface PricingDisplayPlan {
  id: PricingPlanId;
  name: string;
  headline: string;
  description: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline";
  monthlyCents: number | null;
  annualCents: number | null;
  credits: string;
  conversationalAI: string;
  pdfExport: boolean;
  multiChild: boolean;
  supportLevel: string;
  features: string[];
  stripeMonthlyPriceId?: string | null;
  stripeAnnualPriceId?: string | null;
}

export const PRICING_DISPLAY_PLANS: PricingDisplayPlan[] = [
  {
    id: "BASIC",
    name: "Basic",
    headline: "$29/mo • $290/yr",
    description: "Foundational plan for getting started",
    monthlyCents: 2900,
    annualCents: 29000,
    credits: "1 assessment credit per month",
    conversationalAI: "Not included",
    pdfExport: false,
    multiChild: false,
    supportLevel: "Email support",
    features: [
      "1 assessment per month",
      "Progress tracking dashboard",
      "Behavioral trend graph",
      "Parent strategy library",
    ],
    stripeMonthlyPriceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID ?? null,
    stripeAnnualPriceId: process.env.STRIPE_BASIC_ANNUAL_PRICE_ID ?? null,
  },
  {
    id: "PLUS",
    name: "Plus",
    headline: "$49/mo • $490/yr",
    description: "Adds PDF exports for school-ready reports",
    monthlyCents: 4900,
    annualCents: 49000,
    credits: "2 assessment credits per month",
    conversationalAI: "Not included",
    pdfExport: true,
    multiChild: false,
    supportLevel: "Email support",
    features: [
      "Everything in Basic",
      "School-ready PDF exports",
      "Historical assessment archive",
      "Priority email response",
    ],
    stripeMonthlyPriceId: process.env.STRIPE_PLUS_MONTHLY_PRICE_ID ?? null,
    stripeAnnualPriceId: process.env.STRIPE_PLUS_ANNUAL_PRICE_ID ?? null,
  },
  {
    id: "FAMILY",
    name: "Family",
    headline: "$79/mo • $790/yr",
    description: "Built for families tracking multiple children",
    badge: "Most Popular",
    badgeVariant: "default",
    monthlyCents: 7900,
    annualCents: 79000,
    credits: "4 assessment credits per month",
    conversationalAI: "Unlimited sessions",
    pdfExport: true,
    multiChild: true,
    supportLevel: "Priority support",
    features: [
      "Unlimited conversational assessments",
      "Profiles for multiple children",
      "PDF exports & shareable summaries",
      "Priority parent support",
    ],
    stripeMonthlyPriceId: process.env.STRIPE_FAMILY_MONTHLY_PRICE_ID ?? null,
    stripeAnnualPriceId: process.env.STRIPE_FAMILY_ANNUAL_PRICE_ID ?? null,
  },
  {
    id: "PRO",
    name: "Pro",
    headline: "$129/mo • $1290/yr",
    description: "Advanced analytics for power parents & pros",
    badge: "Best Value",
    badgeVariant: "secondary",
    monthlyCents: 12900,
    annualCents: 129000,
    credits: "8 assessment credits per month",
    conversationalAI: "10 conversational sessions per month",
    pdfExport: true,
    multiChild: true,
    supportLevel: "Priority concierge",
    features: [
      "Everything in Family",
      "10 conversational sessions/month",
      "Advanced analytics & trends",
      "Parent coaching templates",
    ],
    stripeMonthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? null,
    stripeAnnualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? null,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    headline: "Custom pricing",
    description: "Districts, clinics, and large organizations",
    monthlyCents: null,
    annualCents: null,
    credits: "Custom credit pools",
    conversationalAI: "Unlimited sessions",
    pdfExport: true,
    multiChild: true,
    supportLevel: "Dedicated success manager",
    features: [
      "District-level dashboards",
      "Unlimited conversational assessments",
      "Dedicated success manager",
      "SIS & LMS integrations",
      "Custom branding & reporting",
    ],
    stripeMonthlyPriceId: null,
    stripeAnnualPriceId: null,
  },
] satisfies PricingDisplayPlan[];

export function getPricingPlanById(
  id: PricingPlanId
): PricingDisplayPlan | undefined {
  return PRICING_DISPLAY_PLANS.find((plan) => plan.id === id);
}

/**
 * Format price in cents to dollars
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Get price by tier
 */
export function getPriceByCents(tier: PricingTier): number {
  return PRICING[tier];
}
