import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const { refCode } = await request.json();
  if (!refCode) {
    return NextResponse.json({ error: "Missing refCode" }, { status: 400 });
  }
  // Validate refCode exists and is active
  const referrer = await prisma.affiliateReferrer.findFirst({
    where: { refCode, status: "active" },
  });
  if (!referrer) {
    return NextResponse.json({ valid: false });
  }
  return NextResponse.json({ valid: true });
}
