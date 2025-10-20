/**
 * Centralized pricing configuration (all amounts in cents for Stripe)
 */
export const PRICING = {
  SINGLE_ASSESSMENT: 9700, // $97.00 one-time
  CONVERSATIONAL_AI: 900, // $9.00 per session
  ENHANCED_REPORT_MEMBER: 900, // $9.00 member rate
  MEMBER_ASSESSMENT_CREDIT: 7700, // $77.00 member-priced top-up
  MONTHLY_CORE: 5900, // $59.00 per month
  ANNUAL_CORE: 59700, // $597.00 per year
  MONTHLY_FAMILY: 9900, // $99.00 per month
  ANNUAL_FAMILY: 99700, // $997.00 per year
  DISCOUNTED_CORE: 2950, // $29.50 per month (limited-time offer)
  DISCOUNTED_FAMILY: 4950, // $49.50 per month (limited-time offer)
  MONTHLY_LITE: 2900, // $29.00 per month
};

export type PricingTier = keyof typeof PRICING;

export type SubscriptionPlanTier = "CORE" | "FAMILY";
export type SubscriptionPlanBillingInterval = "monthly" | "annual";
export type SubscriptionPlanId =
  | "CORE_MONTHLY"
  | "CORE_ANNUAL"
  | "FAMILY_MONTHLY"
  | "FAMILY_ANNUAL";

export interface SubscriptionPlanDefinition {
  id: SubscriptionPlanId;
  tier: SubscriptionPlanTier;
  name: string;
  slug: string;
  label: string;
  billingInterval: SubscriptionPlanBillingInterval;
  priceCents: number;
  priceLabel: string;
  ctaLabel: string;
  savingsLabel?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline";
  badgeAriaLabel?: string;
  creditsPerInterval: number;
  creditIntervalMonths: number;
  rolloverCap: number;
  creditRolloverNote: string;
  conversationalAI: {
    included: boolean;
    unlimited: boolean;
    priceCents?: number;
    description: string;
  };
  enhancedReports: {
    included: number | "unlimited";
    priceCents?: number;
    description: string;
  };
  additionalAssessmentPriceCents: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlanId,
  SubscriptionPlanDefinition
> = {
  CORE_MONTHLY: {
    id: "CORE_MONTHLY",
    tier: "CORE",
    slug: "core",
    name: "Core Plan",
    label: "Core — Monthly",
    billingInterval: "monthly",
    priceCents: PRICING.MONTHLY_CORE,
    priceLabel: "$59/mo",
    ctaLabel: "Upgrade to Core",
    creditsPerInterval: 2,
    creditIntervalMonths: 1,
    rolloverCap: 6,
    creditRolloverNote:
      "Credits roll over up to 6. Oldest credits expire first after 12 months.",
    conversationalAI: {
      included: false,
      unlimited: false,
      priceCents: PRICING.CONVERSATIONAL_AI,
      description: "$9 per session",
    },
    enhancedReports: {
      included: 0,
      priceCents: PRICING.ENHANCED_REPORT_MEMBER,
      description: "Member rate $9 each",
    },
    additionalAssessmentPriceCents: PRICING.MEMBER_ASSESSMENT_CREDIT,
    features: [
      "2 full assessment credits per month (parent or child)",
      "Credit rollover up to 6 total credits",
      "Credits expire after 12 months (oldest expire first)",
      "Conversational AI sessions ($9 each)",
      "Full dashboard access with progress tracking graphs",
      "Parent resource library",
      "School-ready PDF reports",
      "Priority email support",
      "Member discount on additional assessments ($77 per credit)",
      "Enhanced Reports at member rate ($9 each)",
    ],
  },
  CORE_ANNUAL: {
    id: "CORE_ANNUAL",
    tier: "CORE",
    slug: "core",
    name: "Core Plan",
    label: "Core — Annual",
    billingInterval: "annual",
    priceCents: PRICING.ANNUAL_CORE,
    priceLabel: "$597/yr",
    ctaLabel: "Switch to Annual Core",
    savingsLabel: "Save $111 vs monthly",
    badge: "Save $111 / yr",
    badgeVariant: "secondary",
    badgeAriaLabel: "Save one hundred eleven dollars per year",
    creditsPerInterval: 2,
    creditIntervalMonths: 1,
    rolloverCap: 6,
    creditRolloverNote:
      "Credits roll over up to 6. Oldest credits expire first after 12 months.",
    conversationalAI: {
      included: false,
      unlimited: false,
      priceCents: PRICING.CONVERSATIONAL_AI,
      description: "$9 per session",
    },
    enhancedReports: {
      included: 3,
      priceCents: PRICING.ENHANCED_REPORT_MEMBER,
      description: "3 included, additional $9 each",
    },
    additionalAssessmentPriceCents: PRICING.MEMBER_ASSESSMENT_CREDIT,
    features: [
      "Everything in monthly Core Plan",
      "24 assessment credits per year (2 per month cadence)",
      "Credit rollover up to 6 total credits",
      "Credits expire after 12 months (oldest expire first)",
      "Conversational AI $9 per session",
      "3 Enhanced Reports included (additional $9 each)",
    ],
  },
  FAMILY_MONTHLY: {
    id: "FAMILY_MONTHLY",
    tier: "FAMILY",
    slug: "family",
    name: "Family Plan",
    label: "Family — Monthly",
    billingInterval: "monthly",
    priceCents: PRICING.MONTHLY_FAMILY,
    priceLabel: "$99/mo",
    ctaLabel: "Upgrade to Family",
    badge: "Best Value",
    badgeVariant: "default",
    badgeAriaLabel: "Best value plan",
    creditsPerInterval: 5,
    creditIntervalMonths: 1,
    rolloverCap: 15,
    creditRolloverNote:
      "Credits roll over up to 15. Oldest credits expire first after 12 months.",
    conversationalAI: {
      included: true,
      unlimited: true,
      description: "Unlimited included",
    },
    enhancedReports: {
      included: "unlimited",
      description: "All Enhanced Reports included free",
    },
    additionalAssessmentPriceCents: PRICING.MEMBER_ASSESSMENT_CREDIT,
    features: [
      "5 full assessment credits per month (parent or child)",
      "Credit rollover up to 15 total credits",
      "Credits expire after 12 months (oldest expire first)",
      "Unlimited conversational AI sessions included",
      "Multi-child profile management",
      "Full dashboard with advanced features",
      "Progress tracking for all children",
      "Parent resource library (premium access)",
      "All Enhanced Reports included free",
      "Priority support with live chat",
      "Early access to new features",
      "Member discount on additional assessments ($77 per credit)",
    ],
  },
  FAMILY_ANNUAL: {
    id: "FAMILY_ANNUAL",
    tier: "FAMILY",
    slug: "family",
    name: "Family Plan",
    label: "Family — Annual",
    billingInterval: "annual",
    priceCents: PRICING.ANNUAL_FAMILY,
    priceLabel: "$997/yr",
    ctaLabel: "Switch to Annual Family",
    savingsLabel: "Save $191 vs monthly",
    badge: "Save $191 / yr",
    badgeVariant: "secondary",
    badgeAriaLabel: "Save one hundred ninety-one dollars per year",
    creditsPerInterval: 5,
    creditIntervalMonths: 1,
    rolloverCap: 15,
    creditRolloverNote:
      "Credits roll over up to 15. Oldest credits expire first after 12 months.",
    conversationalAI: {
      included: true,
      unlimited: true,
      description: "Unlimited included",
    },
    enhancedReports: {
      included: "unlimited",
      priceCents: PRICING.ENHANCED_REPORT_MEMBER,
      description: "Enhanced Reports included, additional at member rate $9",
    },
    additionalAssessmentPriceCents: PRICING.MEMBER_ASSESSMENT_CREDIT,
    features: [
      "Everything in monthly Family Plan",
      "60 assessment credits per year (5 per month cadence)",
      "Credit rollover up to 15 total credits",
      "Credits expire after 12 months (oldest expire first)",
      "Unlimited conversational AI sessions",
      "Multi-child profiles and advanced dashboard",
      "All additional Enhanced Reports at member rate ($9)",
    ],
  },
};

export const DASHBOARD_PLAN_OPTIONS: SubscriptionPlanDefinition[] = [
  SUBSCRIPTION_PLANS.CORE_MONTHLY,
  SUBSCRIPTION_PLANS.FAMILY_MONTHLY,
  SUBSCRIPTION_PLANS.CORE_ANNUAL,
  SUBSCRIPTION_PLANS.FAMILY_ANNUAL,
];

export type PricingPlanId = "SINGLE" | "CORE" | "FAMILY";

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
}

const coreMonthlyPlan = SUBSCRIPTION_PLANS.CORE_MONTHLY;
const coreAnnualPlan = SUBSCRIPTION_PLANS.CORE_ANNUAL;
const familyMonthlyPlan = SUBSCRIPTION_PLANS.FAMILY_MONTHLY;
const familyAnnualPlan = SUBSCRIPTION_PLANS.FAMILY_ANNUAL;

export const PRICING_DISPLAY_PLANS = [
  {
    id: "SINGLE",
    name: "Single Assessment",
    headline: "$97 one-time",
    description: "One full AI-powered assessment, no subscription required.",
    monthlyCents: 9700,
    annualCents: null,
    credits: "1 assessment credit",
    conversationalAI: "Not included",
    pdfExport: true,
    multiChild: false,
  },
  {
    id: "CORE",
    name: "Core",
    headline: `${coreMonthlyPlan.priceLabel} • ${coreAnnualPlan.priceLabel}`,
    description:
      "For focused parents who want monthly assessment credits and flexible conversational AI add-ons.",
    monthlyCents: coreMonthlyPlan.priceCents,
    annualCents: coreAnnualPlan.priceCents,
    credits: `${coreMonthlyPlan.creditsPerInterval} assessment credits per month`,
    conversationalAI: coreMonthlyPlan.conversationalAI.description,
    pdfExport: true,
    multiChild: false,
  },
  {
    id: "FAMILY",
    name: "Family",
    headline: `${familyMonthlyPlan.priceLabel} • ${familyAnnualPlan.priceLabel}`,
    description:
      "For multi-child families who need advanced dashboards and unlimited conversational AI.",
    badge: "Most Popular",
    badgeVariant: "default",
    monthlyCents: familyMonthlyPlan.priceCents,
    annualCents: familyAnnualPlan.priceCents,
    credits: `${familyMonthlyPlan.creditsPerInterval} assessment credits per month`,
    conversationalAI: familyMonthlyPlan.conversationalAI.description,
    pdfExport: true,
    multiChild: true,
  },
] satisfies PricingDisplayPlan[];

// Utility: format price in cents to dollars
export function formatPrice(cents: number | null | undefined): string {
  if (typeof cents !== "number" || isNaN(cents)) return "-";
  return `$${(cents / 100).toFixed(2)}`;
}

// Utility: get plan by id
export function getPricingPlanById(
  id: PricingPlanId
): PricingDisplayPlan | undefined {
  return PRICING_DISPLAY_PLANS.find((plan) => plan.id === id);
}

export function getSubscriptionPlanById(
  id: SubscriptionPlanId
): SubscriptionPlanDefinition | undefined {
  return SUBSCRIPTION_PLANS[id];
}
