export type PlanTier = "free" | "one_time" | "core" | "family";
export type PlanTerm = "monthly" | "annual" | null;

export interface UserPlanResponse {
  plan: PlanTier;
  term: PlanTerm;
  remainingCredits: number;
  monthlyCredits: number | null;
  rolloverCap: number | null;
  childrenCount: number;
  reportsLast30d: number;
  anonymousModeEnabled: boolean;
  pausedUntil: string | null;
  pauseCount12m: number;
  foundersPricingActive: boolean;
  ribbonSnoozedUntil: string | null;
  pendingAction: {
    type: string;
    effectiveAt: string | null;
    payload?: Record<string, unknown>;
  } | null;
  stripe?: {
    subscriptionId: string;
    status: string;
    priceId: string | null;
    planNickname: string | null;
    amountCents: number | null;
    currency: string | null;
    currentPeriodEnd: string | null;
    currentPeriodStart: string | null;
    cancelAtPeriodEnd: boolean;
    trialEnd: string | null;
  } | null;
  paymentMethod?: {
    id: string;
    brand: string | null;
    last4: string | null;
    expMonth: number | null;
    expYear: number | null;
    isDefault: boolean;
  } | null;
}

export interface PricingAmount {
  amount: number;
  amountCents: number;
  currency: "USD";
  interval: "one_time" | "monthly" | "annual";
  formatted: string;
}

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
    | "enhancedNonMember"
    | "memberCredit",
    PricingAmount
  >;
}
