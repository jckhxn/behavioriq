import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const invoices = payments.map((payment) => ({
      id: payment.id,
      date: payment.createdAt.toISOString(),
      description: payment.plan ?? payment.planType ?? "Payment",
      amount: payment.amount / 100,
      currency: payment.currency,
      status: payment.status,
      downloadUrl: null,
    }));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("[billing/invoices] GET error", error);
    return NextResponse.json(
      { error: "Failed to load invoices" },
      { status: 500 }
    );
  }
}
