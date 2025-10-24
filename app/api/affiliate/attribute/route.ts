import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  isDeviceBanned,
  isVelocityLimited,
  isHouseholdLimited,
  isUserBanned,
} from "@/lib/affiliate/fraud";
import { AFFILIATE_SETTINGS } from "@/lib/config/affiliate";

export async function POST(req: NextRequest) {
  try {
    const { refCode, prospectUserId, clickId, deviceId, ip, utm } = await req.json();

    if (!refCode || !prospectUserId) {
      return NextResponse.json(
        { error: "refCode and prospectUserId are required" },
        { status: 400 }
      );
    }

    // Verify refCode exists
    const referrer = await prisma.affiliateReferrer.findFirst({
      where: { refCode },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    // Device ban check
    if (deviceId && (await isDeviceBanned(deviceId))) {
      return NextResponse.json(
        { error: "Device is banned" },
        { status: 403 }
      );
    }

    // Velocity limit check
    if (deviceId && ip && (await isVelocityLimited(deviceId, ip))) {
      return NextResponse.json(
        { error: "Too many signups from this device or IP" },
        { status: 429 }
      );
    }

    // Household rule check
    const user = await prisma.user.findUnique({
      where: { id: prospectUserId },
    });

    if (user && (await isHouseholdLimited(user.email))) {
      return NextResponse.json(
        { error: "Too many signups from this household" },
        { status: 429 }
      );
    }

    // Ban list check
    if (user && (await isUserBanned(prospectUserId, user.email))) {
      return NextResponse.json(
        { error: "User or email is banned" },
        { status: 403 }
      );
    }

    // Check for existing attribution (prevent duplicates)
    const existing = await prisma.affiliateAttribution.findUnique({
      where: { prospectUserId },
    });

    if (existing && existing.expiresAt > new Date()) {
      console.log(
        `[AffiliateAttribute] Attribution already exists for user ${prospectUserId}`
      );
      return NextResponse.json({
        success: true,
        message: "Attribution already recorded",
        attribution: existing,
      });
    }

    // Create attribution record
    const expiresAt = new Date(
      Date.now() + AFFILIATE_SETTINGS.cookieWindowDays * 24 * 60 * 60 * 1000
    );

    const attribution = await prisma.affiliateAttribution.create({
      data: {
        refCode,
        prospectUserId,
        clickId: clickId || null,
        deviceId: deviceId || null,
        ip: ip || null,
        utm: utm || null,
        expiresAt,
        model: "last_non_direct",
      },
    });

    console.log(
      `[AffiliateAttribute] ✅ Created attribution: ${attribution.id} for user ${prospectUserId}`
    );

    return NextResponse.json({
      success: true,
      attributionId: attribution.id,
      message: "Attribution locked successfully",
    });
  } catch (error) {
    console.error("[AffiliateAttribute] ❌ Error:", error);

    return NextResponse.json(
      {
        error: "Failed to create attribution",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
