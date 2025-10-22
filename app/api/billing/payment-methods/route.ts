import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { stripe } from "@/lib/stripe/config";
import type Stripe from "stripe";

interface PaymentMethodSummary {
  id: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
}

function isStripeCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer
): customer is Stripe.Customer {
  return !(customer as Stripe.DeletedCustomer).deleted;
}

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    const [paymentMethodsResponse, customer] = await Promise.all([
      stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      }),
      stripe.customers.retrieve(user.stripeCustomerId, {
        expand: ["invoice_settings.default_payment_method"],
      }),
    ]);

    const defaultPaymentMethodId =
      isStripeCustomer(customer) &&
      customer.invoice_settings?.default_payment_method &&
      typeof customer.invoice_settings.default_payment_method !== "string"
        ? customer.invoice_settings.default_payment_method.id
        : isStripeCustomer(customer) &&
            typeof customer.invoice_settings?.default_payment_method ===
              "string"
          ? customer.invoice_settings.default_payment_method
          : null;

    const paymentMethods: PaymentMethodSummary[] = paymentMethodsResponse.data.map(
      (pm) => ({
        id: pm.id,
        brand: pm.card?.brand ?? null,
        last4: pm.card?.last4 ?? null,
        expMonth: pm.card?.exp_month ?? null,
        expYear: pm.card?.exp_year ?? null,
        isDefault: pm.id === defaultPaymentMethodId,
      })
    );

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
