import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  isDeviceBanned,
  isVelocityLimited,
  isHouseholdLimited,
  isUserBanned,
} from "@/lib/affiliate/fraud";
import { trackAffiliateEvent } from "@/lib/analytics/trackAffiliateEvent";

export async function POST(req: NextRequest) {
  const { refCode, userId, deviceId, ip, email } = await req.json();
  if (!refCode || !userId) {
    return NextResponse.json(
      { error: "Missing refCode or userId" },
      { status: 400 }
    );
  }

  // Device ban
  if (deviceId && (await isDeviceBanned(deviceId))) {
    return NextResponse.json({ error: "Device is banned" }, { status: 403 });
  }

  // Velocity limit
  if (deviceId && ip && (await isVelocityLimited(deviceId, ip))) {
    return NextResponse.json(
      { error: "Too many signups from this device or IP" },
      { status: 429 }
    );
  }

  // Household rule
  if (email && (await isHouseholdLimited(email))) {
    return NextResponse.json(
      { error: "Too many signups from this household" },
      { status: 429 }
    );
  }

  // Ban list
  if (await isUserBanned(userId, email)) {
    return NextResponse.json(
      { error: "User or email is banned" },
      { status: 403 }
    );
  }

  await prisma.affiliateAttribution.create({
    data: {
      refCode,
      userId,
      deviceId,
      eventType: "signup",
      timestamp: new Date(),
    },
  });
  // Track analytics event
  await trackAffiliateEvent({
    userId,
    event: "referral.signup",
    metadata: { refCode, deviceId, ip, email },
  });
  return NextResponse.json({ success: true });
}
