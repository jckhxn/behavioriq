import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { isUserBanned, isKYCRequired } from "@/lib/affiliate/fraud";
import { trackAffiliateEvent } from "@/lib/analytics/trackAffiliateEvent";

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

  // Calculate payable commissions
  const payable = await prisma.affiliateCommission.findMany({
    where: { refCode: user.refCode, status: "payable" },
  });
  const totalCents = payable.reduce(
    (sum: number, c: { amountCents: number }) => sum + c.amountCents,
    0
  );
  if (totalCents < 1000) {
    // Minimum payout $10
    return NextResponse.json(
      { error: "Minimum payout not met" },
      { status: 400 }
    );
  }

  // KYC/W-9 required for payout over $600
  if (isKYCRequired(totalCents)) {
    // In production, check if user has completed KYC/W-9 before allowing payout
    // For now, just return an error
    return NextResponse.json(
      { error: "KYC/W-9 required for payouts over $600" },
      { status: 403 }
    );
  }

  // TODO: Integrate Stripe Connect payout
  await prisma.affiliatePayout.create({
    data: {
      referrerUserId: user.id,
      amountCents: totalCents,
      status: "pending",
      timestamp: new Date(),
    },
  });
  // Mark commissions as paidOut
  await prisma.affiliateCommission.updateMany({
    where: { refCode: user.refCode, status: "payable" },
    data: { status: "paid" },
  });
  // Track analytics event
  await trackAffiliateEvent({
    userId: user.id,
    event: "referral.payout",
    metadata: { refCode: user.refCode, amountCents: totalCents },
  });
  return NextResponse.json({ success: true, amountCents: totalCents });
}
