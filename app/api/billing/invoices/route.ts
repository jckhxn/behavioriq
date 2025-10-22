import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe/config";

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.stripeCustomerId) {
      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 24,
      });

      const payload = invoices.data.map((invoice) => {
        const firstLine = invoice.lines.data[0];
        return {
          id: invoice.id,
          date: invoice.created ? new Date(invoice.created * 1000).toISOString() : null,
          description:
            firstLine?.description ??
            invoice.description ??
            invoice.metadata?.description ??
            "Invoice",
          amount: invoice.total ? invoice.total / 100 : 0,
          currency: invoice.currency ?? "usd",
          status: invoice.status ?? "open",
          downloadUrl: invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
        };
      });

      return NextResponse.json({ invoices: payload });
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
