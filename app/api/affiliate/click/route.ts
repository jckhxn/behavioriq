import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import {
  isDeviceBanned,
  isVelocityLimited,
} from "@/lib/affiliate/fraud";

export async function POST(req: NextRequest) {
  try {
    const { refCode, sessionId, ip, ua, utm } = await req.json();

    if (!refCode || !sessionId) {
      return NextResponse.json(
        { error: "refCode and sessionId are required" },
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

    // Device ban check (if device ID provided)
    // Note: deviceId should be passed from client via FingerprintJS
    const deviceId = req.headers.get("x-device-id");
    if (deviceId && (await isDeviceBanned(deviceId))) {
      return NextResponse.json(
        { error: "Device is banned" },
        { status: 403 }
      );
    }

    // Velocity limit check
    if (deviceId && ip && (await isVelocityLimited(deviceId, ip))) {
      return NextResponse.json(
        { error: "Too many clicks from this device or IP" },
        { status: 429 }
      );
    }

    // Create click record
    const click = await prisma.affiliateClick.create({
      data: {
        refCode,
        sessionId,
        ip: ip || null,
        ua: ua || null,
        utm: utm || null,
      },
    });

    console.log(
      `[AffiliateClick] ✅ Tracked click: ${click.id} for ${refCode}`
    );

    return NextResponse.json({ success: true, clickId: click.id });
  } catch (error) {
    console.error("[AffiliateClick] ❌ Error:", error);

    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}
