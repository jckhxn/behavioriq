import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserWithRole();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const referrer = await prisma.affiliateReferrer.findFirst({
    where: { userId: user.id },
    include: {
      commissions: true,
      payouts: true,
    },
  });
  if (!referrer) {
    return NextResponse.json(
      { error: "No affiliate profile" },
      { status: 404 }
    );
  }
  // Stats
  const stats = {
    clicks: await prisma.affiliateClick.count({
      where: { refCode: referrer.refCode },
    }),
    signups: await prisma.affiliateAttribution.count({
      where: { refCode: referrer.refCode },
    }),
    paid: await prisma.affiliateCommission.count({
      where: { refCode: referrer.refCode, status: "paid" },
    }),
    pending: await prisma.affiliateCommission.count({
      where: { refCode: referrer.refCode, status: "pending" },
    }),
    payable: await prisma.affiliateCommission.count({
      where: { refCode: referrer.refCode, status: "payable" },
    }),
    paidOut: await prisma.affiliatePayout.count({
      where: { referrerUserId: user.id },
    }),
  };
  // Payable balance
  const payableBalance = await prisma.affiliateCommission.aggregate({
    where: { refCode: referrer.refCode, status: "payable" },
    _sum: { amountCents: true },
  });
  return NextResponse.json({
    profile: referrer,
    stats,
    payableBalance: payableBalance._sum.amountCents || 0,
  });
}
