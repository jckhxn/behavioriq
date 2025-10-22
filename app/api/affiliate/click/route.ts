import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import {
  isDeviceBanned,
  isVelocityLimited,
  isUserBanned,
} from "@/lib/affiliate/fraud";
import { trackAffiliateEvent } from "@/lib/analytics/trackAffiliateEvent";

export async function POST(req: NextRequest) {
  const { refCode, ip, deviceId, userId, email } = await req.json();
  if (!refCode) {
    return NextResponse.json({ error: "Missing refCode" }, { status: 400 });
  }

  // Device ban
  if (deviceId && (await isDeviceBanned(deviceId))) {
    return NextResponse.json({ error: "Device is banned" }, { status: 403 });
  }

  // Velocity limit
  if (deviceId && ip && (await isVelocityLimited(deviceId, ip))) {
    return NextResponse.json(
      { error: "Too many clicks from this device or IP" },
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

  await prisma.affiliateClick.create({
    data: {
      refCode,
      ip,
      deviceId,
      eventType: "click",
      timestamp: new Date(),
    },
  });
  // Track analytics event
  await trackAffiliateEvent({
    userId,
    event: "referral.click",
    metadata: { refCode, ip, deviceId, email },
  });
  return NextResponse.json({ success: true });
}
