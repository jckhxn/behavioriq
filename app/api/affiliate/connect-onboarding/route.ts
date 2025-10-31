/**
 * POST /api/affiliate/connect-onboarding
 * Initiates Stripe Connect Express onboarding for a referrer
 * Returns the onboarding URL that the user should redirect to
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { stripeConnectService } from "@/lib/stripe/connect";

interface ConnectOnboardingRequest {
  businessName?: string;
  businessUrl?: string;
  businessDescription?: string;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse optional business info from request body
    const body = (await req.json().catch(() => ({}))) as ConnectOnboardingRequest;

    // Find referrer record
    const referrer = await prisma.affiliateReferrer.findFirst({
      where: { userId: user.id },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "No affiliate account found" },
        { status: 404 }
      );
    }

    // Check if already onboarded
    if (referrer.stripeConnectAccountId) {
      // Return existing onboarding link or dashboard link
      const accountStatus = await stripeConnectService.checkAccountStatus(
        referrer.stripeConnectAccountId
      );

      if (accountStatus.isReady) {
        // Already completed, return dashboard link
        const dashboardLink = await stripeConnectService.getDashboardLink(
          referrer.stripeConnectAccountId
        );

        return NextResponse.json({
          success: true,
          status: "completed",
          dashboardUrl: dashboardLink,
          message: "Your Connect account is set up! View your dashboard.",
        });
      } else {
        // Still pending, return onboarding link to continue
        const onboardingLink = await stripeConnectService.getOnboardingLink(
          referrer.stripeConnectAccountId
        );

        return NextResponse.json({
          success: true,
          status: "pending",
          onboardingUrl: onboardingLink,
          pendingRequirements: accountStatus.requirements,
          message: "Continue your account setup.",
        });
      }
    }

    // Create new Stripe Connect Express account with optional business info
    const stripeAccountId = await stripeConnectService.createConnectAccount(
      user.email,
      user.name || "Affiliate User",
      {
        businessName: body.businessName,
        businessUrl: body.businessUrl,
        businessDescription: body.businessDescription,
      }
    );

    // Store account ID in database
    const updated = await prisma.affiliateReferrer.update({
      where: { id: referrer.id },
      data: { stripeConnectAccountId: stripeAccountId },
    });

    // Get onboarding link
    const onboardingLink = await stripeConnectService.getOnboardingLink(
      stripeAccountId
    );

    console.log(
      `[ConnectOnboarding] ✅ Created Connect account for user ${user.id}: ${stripeAccountId}`
    );

    return NextResponse.json({
      success: true,
      status: "new",
      onboardingUrl: onboardingLink,
      message:
        "Complete your account setup to start receiving payouts.",
    });
  } catch (error) {
    console.error("[ConnectOnboarding] ❌ Error:", error);

    return NextResponse.json(
      {
        error: "Failed to initiate onboarding",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/affiliate/connect-onboarding
 * Check current onboarding status
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const referrer = await prisma.affiliateReferrer.findFirst({
      where: { userId: user.id },
    });

    if (!referrer || !referrer.stripeConnectAccountId) {
      return NextResponse.json({
        status: "not_started",
        message: "No Connect account created yet",
      });
    }

    const accountStatus = await stripeConnectService.checkAccountStatus(
      referrer.stripeConnectAccountId
    );

    return NextResponse.json({
      status: accountStatus.isReady ? "completed" : "pending",
      isReady: accountStatus.isReady,
      transfersEnabled: accountStatus.transfersEnabled,
      chargesEnabled: accountStatus.chargesEnabled,
      pendingRequirements: accountStatus.requirements,
    });
  } catch (error) {
    console.error("[ConnectOnboarding] ❌ Error:", error);

    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
