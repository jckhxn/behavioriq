import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import {
  validateNotificationPreferences,
  getDefaultNotificationPreferences,
} from "@/lib/affiliate/preferences-validator";

/**
 * GET /api/affiliate/notifications
 * Get notification preferences for current user
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

    // Get or create notification preferences
    let preferences = await prisma.affiliateNotificationPreferences.findUnique({
      where: { referrerId: referrer.id },
    });

    if (!preferences) {
      // Create default preferences
      const defaults = getDefaultNotificationPreferences();
      preferences = await prisma.affiliateNotificationPreferences.create({
        data: {
          referrerId: referrer.id,
          ...defaults,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("[AffiliateNotifications GET] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch notification preferences",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/affiliate/notifications
 * Update notification preferences
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

    // Validate preferences
    const validation = validateNotificationPreferences(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid notification preferences",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Update or create preferences
    const preferences = await prisma.affiliateNotificationPreferences.upsert({
      where: { referrerId: referrer.id },
      create: {
        referrerId: referrer.id,
        ...body,
      },
      update: body,
    });

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("[AffiliateNotifications PUT] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update notification preferences",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
