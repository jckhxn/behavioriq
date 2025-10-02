import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const { assessmentId } = await params;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID required" },
        { status: 400 }
      );
    }

        // Verify assessment exists and belongs to user
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id,
        isConversational: true,
      },
    }) as any; // TypeScript cache workaround

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found or not eligible" },
        { status: 404 }
      );
    }

    // Check if already purchased
    if (assessment.hasEnhancedReport) {
      return NextResponse.json(
        { error: "Enhanced report already purchased" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session for $9 enhanced report
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Enhanced Conversational Report",
              description:
                "Child's voice + AI analysis + School-ready PDF",
              images: [],
            },
            unit_amount: 900, // $9.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?enhanced_unlocked=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        assessmentId,
        productType: "enhanced_report",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[Enhanced Report Checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
