// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // ✅ Better validation
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "❌ STRIPE_WEBHOOK_SECRET is not configured in environment variables"
    );
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  if (!signature) {
    console.error("❌ Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Webhook] ✅ Event received: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      default:
        console.log(`[Webhook] ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] ❌ Error processing ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ============================================================================
// Webhook Event Handlers
// ============================================================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] Processing checkout.session.completed`);
  console.log(`[Webhook] Session ID: ${session.id}`);
  console.log(`[Webhook] Customer: ${session.customer}`);
  console.log(`[Webhook] Payment Status: ${session.payment_status}`);

  if (session.payment_status !== "paid") {
    console.log(`[Webhook] ⚠️ Payment not completed yet`);
    return;
  }

  const metadata = session.metadata;
  if (!metadata) {
    console.error(`[Webhook] ❌ No metadata in session`);
    return;
  }

  const {
    userId,
    assessmentType,
    source,
    childName,
    // Anonymous checkout metadata
    userEmail,
    userName,
    userPasswordHash,
    userSource,
    planType,
    plan,
    // Enhanced report metadata
    productType,
    assessmentId,
  } = metadata;

  console.log(`[Webhook] User ID: ${userId}`);
  console.log(`[Webhook] User Email: ${userEmail}`);
  console.log(`[Webhook] Product Type: ${productType}`);
  console.log(`[Webhook] Assessment Type: ${assessmentType || plan}`);
  console.log(`[Webhook] Source: ${source || userSource}`);

  // Handle enhanced report purchase
  if (productType === "enhanced_report" && assessmentId) {
    console.log(`[Webhook] Processing enhanced report purchase for assessment: ${assessmentId}`);
    
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        hasEnhancedReport: true,
        enhancedReportPurchasedAt: new Date(),
      },
    });

    await prisma.payment.create({
      data: {
        userId: userId!,
        stripePaymentIntentId: session.payment_intent as string,
        stripeCustomerId: session.customer as string,
        amount: 900, // $9.00
        currency: "usd",
        status: "SUCCEEDED",
        planType: "enhanced_report",
        plan: "Enhanced Conversational Report",
        metadata: {
          sessionId: session.id,
          productType: "enhanced_report",
          assessmentId,
        },
      },
    });

    console.log(`[Webhook] ✅ Enhanced report unlocked for assessment: ${assessmentId}`);
    return;
  }

  let user;

  // Handle anonymous checkout (user doesn't exist yet)
  if (!userId && userEmail) {
    console.log(`[Webhook] Creating new user from anonymous checkout`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        licenses: {
          include: {
            license: true,
          },
        },
      },
    });

    if (existingUser) {
      console.log(`[Webhook] User already exists: ${userEmail}`);
      user = existingUser;
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName || null,
          password: userPasswordHash,
          role: "USER",
          isActive: true,
        },
        include: {
          licenses: {
            include: {
              license: true,
            },
          },
        },
      });
      console.log(`[Webhook] ✅ New user created: ${user.email}`);
    }
  } else if (userId) {
    // Handle registered user checkout
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        licenses: {
          include: {
            license: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`[Webhook] ❌ User not found: ${userId}`);
      return;
    }
  } else {
    console.error(`[Webhook] ❌ No user identifier in metadata`);
    return;
  }

  // Activate user account if not already active
  if (!user.isActive) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
    console.log(`[Webhook] ✅ User account activated: ${user.email}`);
  }

  // Activate user account if not already active
  if (!user.isActive) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
    });
    console.log(`[Webhook] ✅ User account activated: ${user.email}`);
  }

  // Determine the assessment type
  const finalAssessmentType = assessmentType || plan || "basic";
  const finalSource = source || userSource || "checkout";

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      stripePaymentIntentId: session.payment_intent as string,
      stripeCustomerId: session.customer as string,
      amount: session.amount_total!, // Amount in cents
      currency: session.currency || "usd",
      status: "SUCCEEDED",
      planType: finalAssessmentType,
      plan:
        finalAssessmentType === "BASIC" || finalAssessmentType === "basic"
          ? "Basic Assessment"
          : "Single Assessment",
      childName: childName || null,
      metadata: {
        sessionId: session.id,
        assessmentType: finalAssessmentType,
        source: finalSource,
        planType: planType || "oneTime",
      },
    },
  });

  console.log(`[Webhook] ✅ Payment record created: ${payment.id}`);

  // Create or update license for the user
  const existingUserLicense = user.licenses[0];

  if (existingUserLicense) {
    // User has existing license - update max assessments
    const currentMax = existingUserLicense.license.maxAssessments || 0;
    await prisma.license.update({
      where: { id: existingUserLicense.license.id },
      data: {
        maxAssessments: currentMax + 1,
        status: "ACTIVE",
      },
    });
    console.log(
      `[Webhook] ✅ License updated: max assessments now ${currentMax + 1}`
    );
  } else {
    // Create new license for user
    const licenseKey = `LIC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newLicense = await prisma.license.create({
      data: {
        licenseKey,
        type: "BASIC",
        status: "ACTIVE",
        maxAssessments: 1,
        maxUsers: 1,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    // Assign license to user
    await prisma.userLicense.create({
      data: {
        userId: user.id,
        licenseId: newLicense.id,
        isActive: true,
      },
    });
    console.log(`[Webhook] ✅ New license created and assigned: ${licenseKey}`);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Processing invoice.payment_succeeded`);
  console.log(`[Webhook] Invoice ID: ${invoice.id}`);
  console.log(`[Webhook] Customer: ${invoice.customer}`);

  // For subscription invoices, the subscription field exists
  const subscriptionId = (invoice as any).subscription;

  if (!subscriptionId) {
    console.log(`[Webhook] ℹ️ Not a subscription invoice`);
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId as string
  );

  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error(`[Webhook] ❌ No userId in subscription metadata`);
    return;
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      licenses: {
        include: {
          license: true,
        },
      },
    },
  });

  if (!user) {
    console.error(`[Webhook] ❌ User not found: ${userId}`);
    return;
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      userId: user.id,
      stripePaymentIntentId: (invoice as any).payment_intent as string,
      stripeCustomerId: invoice.customer as string,
      amount: invoice.amount_paid,
      currency: invoice.currency || "usd",
      status: "SUCCEEDED",
      planType: "monthly",
      plan: "Monthly Subscription",
      metadata: {
        invoiceId: invoice.id,
        subscriptionId: subscription.id,
        billingReason: (invoice as any).billing_reason,
      },
    },
  });

  console.log(`[Webhook] ✅ Payment record created for subscription`);

  // Update or create Professional license (unlimited assessments for subscriptions)
  const existingUserLicense = user.licenses[0];

  if (existingUserLicense) {
    await prisma.license.update({
      where: { id: existingUserLicense.license.id },
      data: {
        type: "PROFESSIONAL",
        status: "ACTIVE",
        maxAssessments: null, // Unlimited
      },
    });
    console.log(`[Webhook] ✅ License upgraded to PROFESSIONAL (unlimited)`);
  } else {
    const licenseKey = `LIC-PRO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newLicense = await prisma.license.create({
      data: {
        licenseKey,
        type: "PROFESSIONAL",
        status: "ACTIVE",
        maxAssessments: null, // Unlimited
        maxUsers: 1,
      },
    });

    await prisma.userLicense.create({
      data: {
        userId: user.id,
        licenseId: newLicense.id,
        isActive: true,
      },
    });
    console.log(`[Webhook] ✅ New PROFESSIONAL license created: ${licenseKey}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Processing customer.subscription.deleted`);
  console.log(`[Webhook] Subscription ID: ${subscription.id}`);

  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error(`[Webhook] ❌ No userId in subscription metadata`);
    return;
  }

  // Find user's licenses
  const userLicenses = await prisma.userLicense.findMany({
    where: { userId },
    include: { license: true },
  });

  if (userLicenses.length === 0) {
    console.error(`[Webhook] ❌ No licenses found for user: ${userId}`);
    return;
  }

  // Cancel all PROFESSIONAL licenses (subscriptions)
  for (const userLicense of userLicenses) {
    if (userLicense.license.type === "PROFESSIONAL") {
      await prisma.license.update({
        where: { id: userLicense.license.id },
        data: {
          status: "CANCELLED",
        },
      });
      console.log(
        `[Webhook] ✅ License cancelled: ${userLicense.license.licenseKey}`
      );
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Processing customer.subscription.updated`);
  console.log(`[Webhook] Subscription ID: ${subscription.id}`);
  console.log(`[Webhook] Status: ${subscription.status}`);

  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error(`[Webhook] ❌ No userId in subscription metadata`);
    return;
  }

  // Find user's licenses
  const userLicenses = await prisma.userLicense.findMany({
    where: { userId },
    include: { license: true },
  });

  if (userLicenses.length === 0) {
    console.error(`[Webhook] ❌ No licenses found for user: ${userId}`);
    return;
  }

  // Update license status based on subscription status
  const isActive = subscription.status === "active";
  const newStatus: "ACTIVE" | "SUSPENDED" | "CANCELLED" = isActive
    ? "ACTIVE"
    : subscription.status === "past_due"
      ? "SUSPENDED"
      : "CANCELLED";

  for (const userLicense of userLicenses) {
    if (userLicense.license.type === "PROFESSIONAL") {
      await prisma.license.update({
        where: { id: userLicense.license.id },
        data: {
          status: newStatus,
        },
      });
      console.log(`[Webhook] ✅ License status updated to: ${newStatus}`);
    }
  }
}
