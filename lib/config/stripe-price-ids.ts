import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanDefinition,
  type SubscriptionPlanId,
} from "./pricing";

type EnvKey = string;

const PLAN_ENV_KEYS: Record<SubscriptionPlanId, EnvKey[]> = {
  CORE_MONTHLY: [
    "STRIPE_MONTHLY_CORE_PRICE_ID",
    "STRIPE_CORE_PLAN_MONTHLY_PRICE_ID",
  ],
  CORE_ANNUAL: [
    "STRIPE_ANNUAL_CORE_PRICE_ID",
    "STRIPE_CORE_PLAN_ANNUAL_PRICE_ID",
  ],
  FAMILY_MONTHLY: [
    "STRIPE_MONTHLY_FAMILY_PRICE_ID",
    "STRIPE_FAMILY_PLAN_MONTHLY_PRICE_ID",
  ],
  FAMILY_ANNUAL: [
    "STRIPE_ANNUAL_FAMILY_PRICE_ID",
    "STRIPE_FAMILY_PLAN_ANNUAL_PRICE_ID",
  ],
};

const SINGLE_ASSESSMENT_KEYS: EnvKey[] = [
  "STRIPE_SINGLE_ASSESSMENT_PRICE_ID",
  "STRIPE_BASIC_PRICE_ID",
];

const OPTIONAL_ENV_KEYS: Record<string, EnvKey[]> = {
  LITE_MONTHLY: ["STRIPE_MONTHLY_LITE_PRICE_ID"],
  CORE_DISCOUNTED: ["STRIPE_DISCOUNTED_CORE_PRICE_ID"],
  FAMILY_DISCOUNTED: ["STRIPE_DISCOUNTED_FAMILY_PRICE_ID"],
  CONVERSATIONAL_AI: ["STRIPE_CONVERSATIONAL_AI_PRICE_ID"],
  ENHANCED_REPORT: ["STRIPE_ENHANCED_REPORT_PRICE_ID"],
};

function readFirstPresent(keys: EnvKey[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
  return undefined;
}

function requireEnv(keys: EnvKey[], label: string): string {
  const value = readFirstPresent(keys);
  if (!value) {
    throw new Error(
      `Missing Stripe price id for ${label}. Expected one of: ${keys.join(", ")}`
    );
  }
  return value;
}

const PLAN_PRICE_IDS: Record<SubscriptionPlanId, string> = {
  CORE_MONTHLY: requireEnv(
    PLAN_ENV_KEYS.CORE_MONTHLY,
    "Core Monthly subscription"
  ),
  CORE_ANNUAL: requireEnv(
    PLAN_ENV_KEYS.CORE_ANNUAL,
    "Core Annual subscription"
  ),
  FAMILY_MONTHLY: requireEnv(
    PLAN_ENV_KEYS.FAMILY_MONTHLY,
    "Family Monthly subscription"
  ),
  FAMILY_ANNUAL: requireEnv(
    PLAN_ENV_KEYS.FAMILY_ANNUAL,
    "Family Annual subscription"
  ),
};

const SINGLE_ASSESSMENT_PRICE_ID = requireEnv(
  SINGLE_ASSESSMENT_KEYS,
  "Single assessment purchase"
);

const OPTIONAL_PRICE_IDS: Record<string, string | undefined> = {
  LITE_MONTHLY: readFirstPresent(OPTIONAL_ENV_KEYS.LITE_MONTHLY),
  CORE_DISCOUNTED: readFirstPresent(OPTIONAL_ENV_KEYS.CORE_DISCOUNTED),
  FAMILY_DISCOUNTED: readFirstPresent(OPTIONAL_ENV_KEYS.FAMILY_DISCOUNTED),
  CONVERSATIONAL_AI: readFirstPresent(OPTIONAL_ENV_KEYS.CONVERSATIONAL_AI),
  ENHANCED_REPORT: readFirstPresent(OPTIONAL_ENV_KEYS.ENHANCED_REPORT),
};

const PRICE_TO_PLAN_MAP = Object.entries(PLAN_PRICE_IDS).reduce<
  Record<string, SubscriptionPlanDefinition["id"]>
>((acc, [planId, price]) => {
  acc[price] = planId as SubscriptionPlanId;
  return acc;
}, {});

export function getStripePriceIdForPlan(planId: SubscriptionPlanId): string {
  return PLAN_PRICE_IDS[planId];
}

export function getPlanForStripePrice(priceId: string) {
  const planId = PRICE_TO_PLAN_MAP[priceId];
  return planId ? SUBSCRIPTION_PLANS[planId] : undefined;
}

export function getSingleAssessmentPriceId(): string {
  return SINGLE_ASSESSMENT_PRICE_ID;
}

export const STRIPE_PRICE_IDS = {
  ...OPTIONAL_PRICE_IDS,
  SINGLE_ASSESSMENT: SINGLE_ASSESSMENT_PRICE_ID,
  MONTHLY_CORE: PLAN_PRICE_IDS.CORE_MONTHLY,
  ANNUAL_CORE: PLAN_PRICE_IDS.CORE_ANNUAL,
  MONTHLY_FAMILY: PLAN_PRICE_IDS.FAMILY_MONTHLY,
  ANNUAL_FAMILY: PLAN_PRICE_IDS.FAMILY_ANNUAL,
} as const;
