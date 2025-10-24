import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

export async function POST(request: NextRequest) {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }
  const { referrerId, action } = await request.json();
  if (!referrerId || !action) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }
  let status: string;
  if (action === "unflag") status = "active";
  else if (action === "ban") status = "banned";
  else return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  await prisma.affiliateReferrer.update({
    where: { id: referrerId },
    data: { status },
  });
  return NextResponse.json({ success: true, status });
}
 