import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { isUserBanned, isVelocityLimited } from "@/lib/affiliate/fraud";
import { trackAffiliateEvent } from "@/lib/analytics/trackAffiliateEvent";

export async function POST(req: NextRequest) {
  const { refCode, orderId, amountCents, userId, deviceId, ip, email } =
    await req.json();
  if (!refCode || !orderId || !amountCents || !userId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Ban list
  if (await isUserBanned(userId, email)) {
    return NextResponse.json(
      { error: "User or email is banned" },
      { status: 403 }
    );
  }

  // Velocity limit
  if (deviceId && ip && (await isVelocityLimited(deviceId, ip))) {
    return NextResponse.json(
      { error: "Too many commissions from this device or IP" },
      { status: 429 }
    );
  }

  await prisma.affiliateCommission.create({
    data: {
      refCode,
      orderId,
      amountCents,
      userId,
      status: "pending",
      timestamp: new Date(),
    },
  });
  // Track analytics event
  await trackAffiliateEvent({
    userId,
    event: "referral.order",
    metadata: { refCode, orderId, amountCents, deviceId, ip, email },
  });
  return NextResponse.json({ success: true });
}
