import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Stripe webhook handler (Express Connect, payouts, etc)
export async function POST(request: NextRequest) {
  // TODO: Verify Stripe signature, parse event
  const event = await request.json();
  // Example: payout completed
  if (event.type === "payout.paid") {
    const payoutId = event.data.object.id;
    // Mark payout as paid
    await prisma.affiliatePayout.update({
      where: { stripePayoutId: payoutId },
      data: { status: "paid" },
    });
  }
  // Add more event types as needed
  return NextResponse.json({ received: true });
}
