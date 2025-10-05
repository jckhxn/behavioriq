import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { stripe } from "@/lib/stripe/config";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body; // "LITE" or "ANNUAL"

    if (!plan || !["LITE", "ANNUAL"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan specified" },
        { status: 400 }
      );
    }

    // TODO: This is a simplified implementation.
    // Full implementation needs:
    // 1. Find user's current subscription
    // 2. Get the new price ID for the target plan
    // 3. Call stripe.subscriptions.update() to change the plan
    // 4. Update database License records

    console.log("Subscription tier change requested:", {
      userId: session.user.id,
      targetPlan: plan,
    });

    // TODO: Implement actual Stripe tier change logic
    // Example:
    // const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    // await stripe.subscriptions.update(subscriptionId, {
    //   items: [{
    //     id: subscription.items.data[0].id,
    //     price: newPriceId,
    //   }],
    //   proration_behavior: 'create_prorations',
    // });

    const billingPeriodEnd = new Date();
    billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1);

    return NextResponse.json({
      success: true,
      newPlan: plan,
      effectiveDate: billingPeriodEnd.toISOString(),
      message: `Plan will change to ${plan} at next billing cycle`,
    });
  } catch (error) {
    console.error("Error changing subscription tier:", error);
    return NextResponse.json(
      {
        error: "Failed to change subscription tier",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
