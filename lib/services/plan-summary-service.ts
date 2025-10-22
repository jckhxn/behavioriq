import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/config";
import { getPlanForStripePrice } from "@/lib/config/stripe-price-ids";
import { AssessmentStatus, type LicenseType } from "@prisma/client";
import type Stripe from "stripe";

export type UserPlanType = "free" | "one_time" | "core" | "family";
export type UserPlanTerm = "monthly" | "annual" | null;

export interface UserPlanSummary {
  plan: UserPlanType;
  term: UserPlanTerm;
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
    payload?: Record<string, any>;
  } | null;
  stripe: {
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
  paymentMethod: {
    id: string;
    brand: string | null;
    last4: string | null;
    expMonth: number | null;
    expYear: number | null;
    isDefault: boolean;
  } | null;
}

interface PlanMappingResult {
  plan: UserPlanType;
  term: UserPlanTerm;
  monthlyCredits: number | null;
  rolloverCap: number | null;
}

function mapLicenseTypeToPlan(
  licenseType: LicenseType | null,
  defaultPlan: UserPlanType = "free"
): PlanMappingResult {
  switch (licenseType) {
    case "BASIC":
      return {
        plan: "one_time",
        term: null,
        monthlyCredits: null,
        rolloverCap: 0,
      };
    case "MONTHLY_LITE":
      return {
        plan: "core",
        term: "monthly",
        monthlyCredits: 1,
        rolloverCap: 2,
      };
    case "CORE":
      return {
        plan: "core",
        term: "monthly",
        monthlyCredits: 2,
        rolloverCap: 6,
      };
    case "ANNUAL_CORE":
      return {
        plan: "core",
        term: "annual",
        monthlyCredits: 2,
        rolloverCap: 6,
      };
    case "DISCOUNTED_CORE":
      return {
        plan: "core",
        term: "monthly",
        monthlyCredits: 2,
        rolloverCap: 6,
      };
    case "FAMILY":
      return {
        plan: "family",
        term: "monthly",
        monthlyCredits: 5,
        rolloverCap: 15,
      };
    case "ANNUAL_FAMILY":
      return {
        plan: "family",
        term: "annual",
        monthlyCredits: 5,
        rolloverCap: 15,
      };
    case "DISCOUNTED_FAMILY":
      return {
        plan: "family",
        term: "monthly",
        monthlyCredits: 5,
        rolloverCap: 15,
      };
    case "PROFESSIONAL":
      return {
        plan: "core",
        term: "monthly",
        monthlyCredits: 2,
        rolloverCap: 6,
      };
    case "ENTERPRISE":
    case "DISTRICT_STANDARD":
    case "DISTRICT_PROFESSIONAL":
    case "DISTRICT_ENTERPRISE":
    case "DISTRICT_PILOT":
      return {
        plan: "family",
        term: null,
        monthlyCredits: null,
        rolloverCap: null,
      };
    default:
      return {
        plan: defaultPlan,
        term: null,
        monthlyCredits: 0,
        rolloverCap: 0,
      };
  }
}

interface StripePlanInfo {
  planOverride: PlanMappingResult | null;
  subscription: UserPlanSummary["stripe"];
  paymentMethod: UserPlanSummary["paymentMethod"];
}

const EMPTY_STRIPE_PLAN_INFO: StripePlanInfo = {
  planOverride: null,
  subscription: null,
  paymentMethod: null,
};

function isStripeCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer
): customer is Stripe.Customer {
  return !(customer as Stripe.DeletedCustomer).deleted;
}

function isStripeProduct(
  product: string | Stripe.Product | Stripe.DeletedProduct | null | undefined
): product is Stripe.Product {
  return Boolean(
    product &&
      typeof product === "object" &&
      !("deleted" in product && product.deleted)
  );
}

type SubscriptionWithLegacyFields = Stripe.Subscription & {
  current_period_end?: number | null;
  current_period_start?: number | null;
  trial_end?: number | null;
};

let upsellSchemaEnsured = false;

async function ensureUpsellStateSchema() {
  if (upsellSchemaEnsured) return;

  try {
    const rows = (await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user_upsell_state'
    `) as Array<{ column_name: string }>;

    const columns = new Set(rows.map((row) => row.column_name));

    const renames: Array<{ old: string; next: string }> = [
      { old: "user_id", next: "userId" },
      { old: "ribbon_snoozed_until", next: "ribbonSnoozedUntil" },
      { old: "ribbon_snoozed_at", next: "ribbonSnoozedAt" },
      { old: "ribbon_snooze_source", next: "ribbonSnoozeSource" },
      { old: "anonymous_mode_default", next: "anonymousModeDefault" },
      { old: "paused_until", next: "pausedUntil" },
      { old: "paused_at", next: "pausedAt" },
      { old: "pause_count12m", next: "pauseCount12m" },
      { old: "pause_history", next: "pauseHistory" },
      { old: "pending_action", next: "pendingAction" },
      { old: "created_at", next: "createdAt" },
      { old: "updated_at", next: "updatedAt" },
    ];

    for (const rename of renames) {
      if (!columns.has(rename.next) && columns.has(rename.old)) {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "user_upsell_state" RENAME COLUMN "${rename.old}" TO "${rename.next}"`
        );
        columns.delete(rename.old);
        columns.add(rename.next);
      }
    }

    await prisma.$executeRawUnsafe(
      'ALTER TABLE "user_upsell_state" ADD COLUMN IF NOT EXISTS "pauseCount12m" INTEGER DEFAULT 0'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "user_upsell_state" ADD COLUMN IF NOT EXISTS "pauseHistory" JSONB'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "user_upsell_state" ADD COLUMN IF NOT EXISTS "pendingAction" JSONB'
    );
  } catch (error) {
    console.warn("[plan-summary] Failed to ensure upsell state schema", error);
  } finally {
    upsellSchemaEnsured = true;
  }
}

async function fetchStripePlanInfo(
  stripeCustomerId: string
): Promise<StripePlanInfo> {
  try {
    const [subscriptions, customer] = await Promise.all([
      stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "all",
        expand: ["data.default_payment_method", "data.items.data.price"],
        limit: 5,
      }),
      stripe.customers.retrieve(stripeCustomerId, {
        expand: ["invoice_settings.default_payment_method"],
      }),
    ]);

    const subscription =
      subscriptions.data.find((sub) =>
        ["active", "trialing", "past_due", "incomplete", "unpaid"].includes(
          sub.status
        )
      ) ??
      subscriptions.data.find((sub) => sub.status === "incomplete_expired") ??
      subscriptions.data[0];

    const price = subscription?.items?.data?.[0]?.price ?? null;
    const planDefinition = price?.id ? getPlanForStripePrice(price.id) : undefined;
    const derivedPlan: UserPlanType =
      planDefinition?.tier === "FAMILY" ? "family" : "core";
    const planOverride: PlanMappingResult | null = planDefinition
      ? {
          plan: derivedPlan,
          term: planDefinition.billingInterval,
          monthlyCredits: planDefinition.creditsPerInterval,
          rolloverCap: planDefinition.rolloverCap,
        }
      : null;

    const subscriptionWithLegacy = subscription as SubscriptionWithLegacyFields | null;
    const productName = isStripeProduct(price?.product) ? price?.product.name : null;
    const currentPeriodEnd = subscriptionWithLegacy?.current_period_end
      ? new Date(subscriptionWithLegacy.current_period_end * 1000).toISOString()
      : null;
    const currentPeriodStart = subscriptionWithLegacy?.current_period_start
      ? new Date(subscriptionWithLegacy.current_period_start * 1000).toISOString()
      : null;
    const trialEnd = subscriptionWithLegacy?.trial_end
      ? new Date(subscriptionWithLegacy.trial_end * 1000).toISOString()
      : null;

    const subscriptionInfo = subscription
      ? {
          subscriptionId: subscription.id,
          status: subscription.status,
          priceId: price?.id ?? null,
          planNickname:
            price?.nickname ?? productName,
          amountCents: price?.unit_amount ?? null,
          currency: price?.currency ?? null,
          currentPeriodEnd,
          currentPeriodStart,
          cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
          trialEnd,
        }
      : null;

    const subscriptionDefaultPaymentMethod =
      subscription?.default_payment_method &&
      typeof subscription.default_payment_method !== "string"
        ? (subscription.default_payment_method as Stripe.PaymentMethod)
        : null;

    const customerDefaultPaymentMethod =
      isStripeCustomer(customer) &&
      customer.invoice_settings?.default_payment_method &&
      typeof customer.invoice_settings.default_payment_method !== "string"
        ? (customer.invoice_settings
            .default_payment_method as Stripe.PaymentMethod)
        : null;

    const defaultPaymentMethod =
      subscriptionDefaultPaymentMethod ?? customerDefaultPaymentMethod;

    const paymentMethodInfo = defaultPaymentMethod
      ? {
          id: defaultPaymentMethod.id,
          brand: defaultPaymentMethod.card?.brand ?? null,
          last4: defaultPaymentMethod.card?.last4 ?? null,
          expMonth: defaultPaymentMethod.card?.exp_month ?? null,
          expYear: defaultPaymentMethod.card?.exp_year ?? null,
          isDefault: true,
        }
      : null;

    return {
      planOverride,
      subscription: subscriptionInfo,
      paymentMethod: paymentMethodInfo,
    };
  } catch (error) {
    console.error("[plan-summary] Failed to load Stripe subscription", error);
    return EMPTY_STRIPE_PLAN_INFO;
  }
}

type GetUserPlanSummaryOptions = {
  stripeCustomerId?: string | null;
};

export async function getUserPlanSummary(
  userId: string,
  options: GetUserPlanSummaryOptions = {}
): Promise<UserPlanSummary> {
  await ensureUpsellStateSchema();

  const stripeInfoPromise = options.stripeCustomerId
    ? fetchStripePlanInfo(options.stripeCustomerId)
    : Promise.resolve(EMPTY_STRIPE_PLAN_INFO);

  const [
    activeLicense,
    childSubjects,
    reportsLast30d,
    upsellState,
    stripeInfo,
  ] = await Promise.all([
    prisma.userLicense.findFirst({
      where: {
        userId,
        isActive: true,
        license: {
          status: "ACTIVE",
        },
      },
      include: {
        license: {
          select: {
            type: true,
            status: true,
            validUntil: true,
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    }),
    prisma.assessment.findMany({
      where: {
        userId,
      },
      distinct: ["subjectName"],
      select: {
        subjectName: true,
      },
    }),
    prisma.assessment.count({
      where: {
        userId,
        status: AssessmentStatus.COMPLETED,
        completedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.userUpsellState.findUnique({
      where: { userId },
    }),
    stripeInfoPromise,
  ]);

  let mapping = mapLicenseTypeToPlan(activeLicense?.license?.type ?? null);
  if (!activeLicense && stripeInfo.planOverride) {
    mapping = stripeInfo.planOverride;
  }

  const pauseHistoryRaw = (upsellState?.pauseHistory ?? []) as any;
  const pauseDates = Array.isArray(pauseHistoryRaw)
    ? pauseHistoryRaw
        .map((value) => {
          try {
            return new Date(value);
          } catch {
            return null;
          }
        })
        .filter(
          (value): value is Date =>
            value instanceof Date && !Number.isNaN(value.getTime())
        )
    : [];
  const twelveMonthsAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  const pauseCount12m = pauseDates.filter(
    (date) => date.getTime() >= twelveMonthsAgo
  ).length;

  const pendingActionRaw = (upsellState?.pendingAction ?? null) as any;
  const pendingAction = pendingActionRaw
    ? {
        type: String(pendingActionRaw.type ?? ""),
        effectiveAt: pendingActionRaw.effectiveAt ?? null,
        payload: pendingActionRaw.payload ?? undefined,
      }
    : null;

  const remainingCredits = activeLicense
    ? Math.max(0, activeLicense.assessmentsAllowed - activeLicense.assessmentsUsed)
    : mapping.monthlyCredits ?? 0;

  const pausedUntil = upsellState?.pausedUntil
    ? upsellState.pausedUntil.toISOString()
    : null;

  const foundersPricingActive = isFoundersPricingActive();

  return {
    plan: mapping.plan,
    term: mapping.term,
    remainingCredits,
    monthlyCredits: mapping.monthlyCredits,
    rolloverCap: mapping.rolloverCap,
    childrenCount: childSubjects.length,
    reportsLast30d,
    anonymousModeEnabled: upsellState?.anonymousModeDefault ?? false,
    pausedUntil,
    pauseCount12m,
    foundersPricingActive,
    ribbonSnoozedUntil: upsellState?.ribbonSnoozedUntil
      ? upsellState.ribbonSnoozedUntil.toISOString()
      : null,
    pendingAction,
    stripe: stripeInfo.subscription,
    paymentMethod: stripeInfo.paymentMethod,
  };
}

export async function getOrCreateUpsellState(userId: string) {
  return prisma.userUpsellState.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function snoozePlanRibbon(
  userId: string,
  {
    durationHours,
    source,
  }: { durationHours: number; source?: string }
) {
  const snoozeUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  await prisma.userUpsellState.upsert({
    where: { userId },
    update: {
      ribbonSnoozedUntil: snoozeUntil,
      ribbonSnoozedAt: new Date(),
      ribbonSnoozeSource: source,
    },
    create: {
      userId,
      ribbonSnoozedUntil: snoozeUntil,
      ribbonSnoozedAt: new Date(),
      ribbonSnoozeSource: source,
    },
  });
  return snoozeUntil.toISOString();
}

export function isFoundersPricingActive(): boolean {
  const cutoff = process.env.FOUNDERS_PRICING_DEADLINE;
  if (!cutoff) return false;
  const cutoffDate = new Date(cutoff);
  return Number.isFinite(cutoffDate.getTime()) && cutoffDate.getTime() > Date.now();
}

export async function setAnonymousModeDefault(
  userId: string,
  enabled: boolean
) {
  const record = await prisma.userUpsellState.upsert({
    where: { userId },
    update: {
      anonymousModeDefault: enabled,
    },
    create: {
      userId,
      anonymousModeDefault: enabled,
    },
  });

  return record.anonymousModeDefault;
}

export class PlanPauseLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanPauseLimitError";
  }
}

function sanitizePauseHistory(history: any): string[] {
  if (!Array.isArray(history)) return [];
  return history
    .map((value) => {
      try {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch {
        return null;
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
}

export async function pauseUserPlan(userId: string, durationDays = 60) {
  const state = await getOrCreateUpsellState(userId);
  const history = sanitizePauseHistory(state.pauseHistory);
  const now = new Date();
  const twelveMonthsAgo = now.getTime() - 365 * 24 * 60 * 60 * 1000;
  const recentPauses = history.filter(
    (iso) => new Date(iso).getTime() >= twelveMonthsAgo
  );

  if (recentPauses.length >= 2) {
    throw new PlanPauseLimitError(
      "You have reached the pause limit within the last 12 months."
    );
  }

  const resumeAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const updatedHistory = [...recentPauses, now.toISOString()];

  await prisma.userUpsellState.update({
    where: { userId },
    data: {
      pausedAt: now,
      pausedUntil: resumeAt,
      pauseHistory: updatedHistory,
      pauseCount12m: updatedHistory.length,
    },
  });

  return resumeAt;
}

export async function resumeUserPlan(userId: string) {
  await prisma.userUpsellState.update({
    where: { userId },
    data: {
      pausedAt: null,
      pausedUntil: null,
    },
  });
}
