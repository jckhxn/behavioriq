import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "@/lib/config/pricing";

type PlanSlug = "core" | "family";

function slugToPlanId(slug: PlanSlug, term: "monthly" | "annual"): SubscriptionPlanId {
  const upper = slug.toUpperCase() as "CORE" | "FAMILY";
  const termUpper = term === "monthly" ? "MONTHLY" : "ANNUAL";
  return `${upper}_${termUpper}` as SubscriptionPlanId;
}

interface ProrateCalculation {
  currentPlan: {
    name: string;
    priceCents: number;
    term: string;
  };
  targetPlan: {
    name: string;
    priceCents: number;
    term: string;
  };
  daysRemaining: number;
  totalDaysInBillingPeriod: number;
  currentPlanCredit: number; // Amount to credit for remaining days on current plan
  targetPlanCharge: number; // Amount to charge for new plan
  finalCharge: number; // Net amount user pays (targetPlanCharge - currentPlanCredit)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const targetSlug = body?.target as PlanSlug;
    const targetTerm = body?.term as "monthly" | "annual" || "monthly";

    if (!targetSlug || !["core", "family"].includes(targetSlug)) {
      return NextResponse.json(
        { error: "Invalid target plan" },
        { status: 400 }
      );
    }

    // Get user's current subscription
    const userPlan = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        licenses: {
          where: { isActive: true },
          include: { license: true },
          take: 1,
          orderBy: { assignedAt: "desc" },
        },
      },
    });

    if (!userPlan?.licenses?.[0]) {
      return NextResponse.json(
        { error: "User has no active subscription" },
        { status: 400 }
      );
    }

    const currentLicense = userPlan.licenses[0].license;
    const currentType = currentLicense.type as string;

    // Map license type to current plan ID
    let currentPlanId: SubscriptionPlanId | null = null;
    if (currentType === "CORE") currentPlanId = "CORE_MONTHLY";
    else if (currentType === "ANNUAL_CORE") currentPlanId = "CORE_ANNUAL";
    else if (currentType === "FAMILY") currentPlanId = "FAMILY_MONTHLY";
    else if (currentType === "ANNUAL_FAMILY") currentPlanId = "FAMILY_ANNUAL";

    if (!currentPlanId) {
      return NextResponse.json(
        { error: "Unable to determine current plan type" },
        { status: 400 }
      );
    }

    const currentPlan = SUBSCRIPTION_PLANS[currentPlanId];
    const targetPlanId = slugToPlanId(targetSlug, targetTerm);
    const targetPlan = SUBSCRIPTION_PLANS[targetPlanId];

    // Get current period end from Stripe subscription
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: { not: null } },
    });

    let daysRemaining = 0;
    let totalDaysInBillingPeriod = 0;

    if (subscription?.currentPeriodEnd) {
      const now = new Date();
      const periodEnd = new Date(subscription.currentPeriodEnd);
      daysRemaining = Math.max(
        0,
        Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      const periodStart = new Date(subscription.currentPeriodStart || now);
      totalDaysInBillingPeriod = Math.ceil(
        (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
      );
    } else {
      // Default to 30 days if we can't get billing cycle info
      daysRemaining = 30;
      totalDaysInBillingPeriod = 30;
    }

    // Calculate prorations
    const dailyRateCurrentPlan = currentPlan.priceCents / totalDaysInBillingPeriod;
    const currentPlanCredit = Math.round(dailyRateCurrentPlan * daysRemaining);
    const targetPlanCharge = targetPlan.priceCents;
    const finalCharge = Math.max(0, targetPlanCharge - currentPlanCredit);

    const result: ProrateCalculation = {
      currentPlan: {
        name: currentPlan.label,
        priceCents: currentPlan.priceCents,
        term: `${currentPlan.billingInterval}`,
      },
      targetPlan: {
        name: targetPlan.label,
        priceCents: targetPlan.priceCents,
        term: `${targetPlan.billingInterval}`,
      },
      daysRemaining,
      totalDaysInBillingPeriod,
      currentPlanCredit,
      targetPlanCharge,
      finalCharge,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[checkout/proration] POST error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to calculate proration" },
      { status: 500 }
    );
  }
}
