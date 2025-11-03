import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import {
  validatePayoutPreferences,
  sanitizePayoutPreferences,
  getDefaultPayoutPreferences,
} from "@/lib/affiliate/preferences-validator";

/**
 * GET /api/affiliate/preferences
 * Get payout preferences for current user
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUserWithRole();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get referrer account
    const referrer = await prisma.affiliateReferrer.findFirst({
      where: { userId: user.id },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "No affiliate profile" },
        { status: 404 }
      );
    }

    // Get or create preferences
    let preferences = await prisma.affiliatePayoutPreferences.findUnique({
      where: { referrerId: referrer.id },
    });

    if (!preferences) {
      // Create default preferences
      const defaults = getDefaultPayoutPreferences();
      preferences = await prisma.affiliatePayoutPreferences.create({
        data: {
          referrerId: referrer.id,
          ...defaults,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("[AffiliatePreferences GET] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch preferences",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/affiliate/preferences
 * Update payout preferences
 */
export async function PUT(request: NextRequest) {
  const user = await getCurrentUserWithRole();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get referrer account
    const referrer = await prisma.affiliateReferrer.findFirst({
      where: { userId: user.id },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "No affiliate profile" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Sanitize input
    const sanitized = sanitizePayoutPreferences(body);

    // Validate preferences
    const validation = validatePayoutPreferences(sanitized);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid preferences",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Update or create preferences
    const preferences = await prisma.affiliatePayoutPreferences.upsert({
      where: { referrerId: referrer.id },
      create: {
        referrerId: referrer.id,
        ...sanitized,
      },
      update: sanitized,
    });

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("[AffiliatePreferences PUT] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update preferences",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
