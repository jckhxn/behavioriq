import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { isUserBanned, isKYCRequired } from "@/lib/affiliate/fraud";
import { trackAffiliateEvent } from "@/lib/analytics/trackAffiliateEvent";
import { stripeConnectService } from "@/lib/stripe/connect";

const PAYOUT_THRESHOLD_CENTS = 5000; // $50

export async function POST(req: NextRequest) {
  const user = await getCurrentUserWithRole();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ban list
  if (await isUserBanned(user.id, user.email)) {
    return NextResponse.json(
      { error: "User or email is banned" },
      { status: 403 }
    );
  }

  try {
    // Get referrer account
    const referrer = await prisma.affiliateReferrer.findFirst({
      where: { userId: user.id },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "No affiliate account found" },
        { status: 404 }
      );
    }

    // Check if Stripe Connect is set up
    if (!referrer.stripeConnectAccountId) {
      return NextResponse.json(
        {
          error: "Stripe Connect account not set up",
          message: "Please complete the onboarding process first",
        },
        { status: 403 }
      );
    }

    // Calculate payable commissions
    const payable = await prisma.affiliateCommission.findMany({
      where: { referrerId: referrer.id, status: "payable" },
    });

    const totalCents = payable.reduce(
      (sum: number, c: { amountCents: number }) => sum + c.amountCents,
      0
    );

    // Check minimum threshold
    if (totalCents < PAYOUT_THRESHOLD_CENTS) {
      return NextResponse.json(
        {
          error: "Minimum payout not met",
          minimum: PAYOUT_THRESHOLD_CENTS,
          current: totalCents,
        },
        { status: 400 }
      );
    }

    // KYC/W-9 required for payout over $600
    if (isKYCRequired(totalCents)) {
      // Check if account has completed KYC
      const accountStatus = await stripeConnectService.checkAccountStatus(
        referrer.stripeConnectAccountId
      );

      if (!accountStatus.isReady) {
        return NextResponse.json(
          {
            error: "Account verification required",
            message: "Please complete KYC verification to request payouts over $600",
            pendingRequirements: accountStatus.requirements,
          },
          { status: 403 }
        );
      }
    }

    // Check that transfers are enabled
    const accountStatus = await stripeConnectService.checkAccountStatus(
      referrer.stripeConnectAccountId
    );

    if (!accountStatus.transfersEnabled) {
      return NextResponse.json(
        {
          error: "Transfers not enabled on account",
          message: "Please complete your account setup",
        },
        { status: 403 }
      );
    }

    // Create payout via Stripe Connect
    const payoutResult = await stripeConnectService.createPayout(
      referrer.stripeConnectAccountId,
      totalCents,
      `BehaviorIQ referral payout - ${new Date().toISOString().split("T")[0]}`
    );

    if (!payoutResult.success) {
      return NextResponse.json(
        {
          error: "Payout failed",
          details: payoutResult.error,
        },
        { status: 500 }
      );
    }

    // Create payout record
    const payout = await prisma.affiliatePayout.create({
      data: {
        referrerId: referrer.id,
        amountCents: totalCents,
        status: "sent",
        provider: "stripe_connect",
        transferId: payoutResult.transferId,
      },
    });

    // Mark commissions as paid
    await prisma.affiliateCommission.updateMany({
      where: { referrerId: referrer.id, status: "payable" },
      data: { status: "paid" },
    });

    // Track analytics event
    await trackAffiliateEvent({
      userId: user.id,
      event: "referral.payout",
      metadata: {
        refCode: referrer.refCode,
        amountCents: totalCents,
        transferId: payoutResult.transferId,
      },
    });

    console.log(
      `[PayoutRoute] ✅ Payout created: ${payout.id} (${totalCents} cents)`
    );

    return NextResponse.json({
      success: true,
      amountCents: totalCents,
      transferId: payoutResult.transferId,
      message: "Payout initiated successfully. Funds will arrive in 1-3 business days.",
    });
  } catch (error) {
    console.error("[PayoutRoute] ❌ Error:", error);

    return NextResponse.json(
      {
        error: "Payout request failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
