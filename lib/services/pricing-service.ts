import { PRICING } from "@/lib/config/pricing";
import { isFoundersPricingActive } from "@/lib/services/plan-summary-service";

export interface PricingResponse {
  foundersActive: boolean;
  countdownEndsAt: string | null;
  amounts: Record<
    | "single"
    | "coreMonthly"
    | "coreAnnual"
    | "familyMonthly"
    | "familyAnnual"
    | "enhancedMember"
    | "enhancedNonMember",
    {
      amount: number;
      currency: "USD";
      interval: "one_time" | "monthly" | "annual";
      formatted: string;
      amountCents: number;
    }
  >;
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getPricingPayload(): PricingResponse {
  const countdownEndsAt = process.env.FOUNDERS_PRICING_DEADLINE ?? null;

  const amounts = {
    single: {
      amount: PRICING.SINGLE_ASSESSMENT / 100,
      currency: "USD" as const,
      interval: "one_time" as const,
      formatted: formatUsd(PRICING.SINGLE_ASSESSMENT / 100),
      amountCents: PRICING.SINGLE_ASSESSMENT,
    },
    coreMonthly: {
      amount: PRICING.MONTHLY_CORE / 100,
      currency: "USD" as const,
      interval: "monthly" as const,
      formatted: formatUsd(PRICING.MONTHLY_CORE / 100),
      amountCents: PRICING.MONTHLY_CORE,
    },
    coreAnnual: {
      amount: PRICING.ANNUAL_CORE / 100,
      currency: "USD" as const,
      interval: "annual" as const,
      formatted: formatUsd(PRICING.ANNUAL_CORE / 100),
      amountCents: PRICING.ANNUAL_CORE,
    },
    familyMonthly: {
      amount: PRICING.MONTHLY_FAMILY / 100,
      currency: "USD" as const,
      interval: "monthly" as const,
      formatted: formatUsd(PRICING.MONTHLY_FAMILY / 100),
      amountCents: PRICING.MONTHLY_FAMILY,
    },
    familyAnnual: {
      amount: PRICING.ANNUAL_FAMILY / 100,
      currency: "USD" as const,
      interval: "annual" as const,
      formatted: formatUsd(PRICING.ANNUAL_FAMILY / 100),
      amountCents: PRICING.ANNUAL_FAMILY,
    },
    enhancedMember: {
      amount: PRICING.ENHANCED_REPORT_MEMBER / 100,
      currency: "USD" as const,
      interval: "one_time" as const,
      formatted: formatUsd(PRICING.ENHANCED_REPORT_MEMBER / 100),
      amountCents: PRICING.ENHANCED_REPORT_MEMBER,
    },
    enhancedNonMember: {
      amount: PRICING.ENHANCED_REPORT_MEMBER / 100 + 20,
      currency: "USD" as const,
      interval: "one_time" as const,
      formatted: formatUsd(PRICING.ENHANCED_REPORT_MEMBER / 100 + 20),
      amountCents: PRICING.ENHANCED_REPORT_MEMBER + 2000,
    },
    memberCredit: {
      amount: PRICING.MEMBER_ASSESSMENT_CREDIT / 100,
      currency: "USD" as const,
      interval: "one_time" as const,
      formatted: formatUsd(PRICING.MEMBER_ASSESSMENT_CREDIT / 100),
      amountCents: PRICING.MEMBER_ASSESSMENT_CREDIT,
    },
  } satisfies PricingResponse["amounts"];

  return {
    foundersActive: isFoundersPricingActive(),
    countdownEndsAt,
    amounts,
  };
}
