import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { nanoid } from "nanoid";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

export async function POST(request: NextRequest) {
  const user = await getCurrentUserWithRole();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let refCode = nanoid(8);
  // Check if already exists
  let existing = await prisma.affiliateReferrer.findFirst({
    where: { userId: user.id },
  });
  if (existing) {
    return NextResponse.json({ refCode: existing.refCode });
  }
  // Ensure unique code
  while (await prisma.affiliateReferrer.findFirst({ where: { refCode } })) {
    refCode = nanoid(8);
  }
  await prisma.affiliateReferrer.create({
    data: {
      userId: user.id,
      refCode,
      status: "active",
    },
  });
  return NextResponse.json({ refCode });
}
