import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import {
  SubscriptionPlanId,
  getSubscriptionPlanById,
} from "@/lib/config/pricing";
import { getStripePriceIdForPlan } from "@/lib/config/stripe-price-ids";
import { applySubscriptionPlanToUser } from "@/lib/services/subscription-plan-updater";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const PLAN_ID_ALIAS: Record<string, SubscriptionPlanId> = {
  CORE: "CORE_MONTHLY",
  CORE_MONTHLY: "CORE_MONTHLY",
  MONTHLY_CORE: "CORE_MONTHLY",
  CORE_ANNUAL: "CORE_ANNUAL",
  ANNUAL_CORE: "CORE_ANNUAL",
  FAMILY: "FAMILY_MONTHLY",
  FAMILY_MONTHLY: "FAMILY_MONTHLY",
  MONTHLY_FAMILY: "FAMILY_MONTHLY",
  FAMILY_ANNUAL: "FAMILY_ANNUAL",
  ANNUAL_FAMILY: "FAMILY_ANNUAL",
};

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rawPlanId = body.planId as string | undefined;
  const billing = body.billing as "monthly" | "annual" | undefined;
  const topUp = Boolean(body.topUp);

  const normalizedPlanId = rawPlanId
    ? PLAN_ID_ALIAS[rawPlanId.toUpperCase()]
    : undefined;

  if (!normalizedPlanId) {
    return NextResponse.json(
      { error: "Invalid plan id requested" },
      { status: 400 }
    );
  }

  const plan = getSubscriptionPlanById(normalizedPlanId);
  if (!plan) {
    return NextResponse.json(
      { error: "Plan configuration not found" },
      { status: 400 }
    );
  }

  if (billing && billing !== plan.billingInterval) {
    return NextResponse.json(
      { error: "Billing interval mismatch for selected plan" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Stripe customer not found for account" },
      { status: 404 }
    );
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "active",
    limit: 1,
  });
  const activeSubscription = subscriptions.data[0];

  if (!activeSubscription) {
    return NextResponse.json(
      { error: "No active subscription found for customer" },
      { status: 404 }
    );
  }

  const subscriptionItem = activeSubscription.items.data[0];
  if (!subscriptionItem) {
    return NextResponse.json(
      { error: "Subscription items not found" },
      { status: 404 }
    );
  }

  try {
    await stripe.subscriptions.update(activeSubscription.id, {
      items: [
        {
          id: subscriptionItem.id,
          price: getStripePriceIdForPlan(plan.id),
        },
      ],
      proration_behavior: "create_prorations",
      expand: ["latest_invoice.payment_intent"],
    });
  } catch (error: any) {
    console.error("[change-plan] Stripe update failed", error);
    return NextResponse.json(
      { error: "Failed to update subscription with Stripe" },
      { status: 502 }
    );
  }

  try {
    await prisma.$transaction((tx) =>
      applySubscriptionPlanToUser(tx, userId, plan, { topUp })
    );
  } catch (error) {
    console.error("[change-plan] Failed to update license", error);
    return NextResponse.json(
      { error: "Failed to update license after subscription change" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    plan: plan.id,
    billingInterval: plan.billingInterval,
    topUp,
  });
}
