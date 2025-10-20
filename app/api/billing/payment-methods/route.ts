import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

interface PaymentMethodSummary {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Placeholder response – real implementation should fetch from Stripe
    const paymentMethods: PaymentMethodSummary[] = [];

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error("[billing/payment-methods] GET error", error);
    return NextResponse.json(
      { error: "Failed to load payment methods" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    // In a real implementation, we'd create a Stripe setup intent here.
    return NextResponse.json({ success: true, setupIntentClientSecret: null, requested: body });
  } catch (error) {
    console.error("[billing/payment-methods] POST error", error);
    return NextResponse.json(
      { error: "Failed to update payment methods" },
      { status: 500 }
    );
  }
}
