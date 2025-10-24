import { prismaService as prisma } from "@/lib/db/prisma-service";
import { PRICING } from "@/lib/config/pricing";
import { userRepository } from "@/lib/db/repositories/user-repository";
import { paymentRepository } from "@/lib/db/repositories/payment-repository";
import { licenseRepository } from "@/lib/db/repositories/license-repository";
import { assessmentRepository } from "@/lib/db/repositories/assessment-repository";
import { generateLicenseKey } from "@/lib/config/license";
import { getAssessmentDisplayName } from "@/lib/config/assessment";
import { loginTokenService } from "@/lib/auth/login-token-service";
import type { Stripe } from "stripe";
import type { Prisma } from "@prisma/client";

export class PaymentService {
  /**
   * Process a successful checkout session
   * Uses database transaction for atomicity
   */
  async processCheckout(session: Stripe.Checkout.Session) {
    const { userId, userEmail, productType, assessmentId } =
      session.metadata || {};

    console.log(`[PaymentService] Processing checkout: ${session.id}`);
    console.log(`[PaymentService] Product type: ${productType}`);

    // Handle enhanced report purchase
    if (productType === "enhanced_report" && assessmentId) {
      return this.processEnhancedReportPurchase(session, assessmentId);
    }

    // Handle conversational addon purchase
    if (productType === "conversational_addon") {
      return this.processConversationalAddonPurchase(session);
    }

    // Handle subscription checkout differently (license sync occurs via invoice webhook)
    if (session.mode === "subscription") {
      const subscriptionResult = await this.processSubscriptionCheckout(session);
      const loginToken = await loginTokenService.generateToken(
        subscriptionResult.user.id
      );
      console.log(
        `[PaymentService] Login token generated for subscription: ${loginToken.substring(0, 8)}...`
      );
      return { ...subscriptionResult, loginToken };
    }

    // Handle assessment/subscription purchase
    return this.processAssessmentPurchase(session);
  }

  /**
   * Process enhanced report purchase
   */
  private async processEnhancedReportPurchase(
    session: Stripe.Checkout.Session,
    assessmentId: string
  ) {
    console.log(
      `[PaymentService] Processing enhanced report for: ${assessmentId}`
    );

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get assessment
      const assessment = await tx.assessment.findUniqueOrThrow({
        where: { id: assessmentId },
      });

      // Update assessment
      const updatedAssessment = await tx.assessment.update({
        where: { id: assessmentId },
        data: {
          hasEnhancedReport: true,
          enhancedReportPurchasedAt: new Date(),
        } as any,
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          userId: assessment.userId,
          stripePaymentIntentId: session.payment_intent as string,
          stripeCustomerId: session.customer as string,
          amount: PRICING.ENHANCED_REPORT_MEMBER,
          currency: "usd",
          status: "SUCCEEDED",
          planType: "enhanced_report",
          plan: "Enhanced Conversational Report",
          metadata: {
            sessionId: session.id,
            productType: "enhanced_report",
            assessmentId,
          } as any,
        },
      });

      console.log(
        `[PaymentService] ✅ Enhanced report unlocked: ${assessmentId}`
      );
      return { assessment: updatedAssessment, payment };
    });
  }

  /**
   * Process conversational addon purchase ($9 addon)
   * Gives user 1 conversational assessment credit
   */
  private async processConversationalAddonPurchase(
    session: Stripe.Checkout.Session
  ) {
    const { userId } = session.metadata || {};

    if (!userId) {
      throw new Error("User ID required for conversational addon purchase");
    }

    console.log(
      `[PaymentService] Processing conversational addon for user: ${userId}`
    );

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get the user
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
      });

      // Get or create user's license
  let userLicense: any = await tx.userLicense.findFirst({
        where: { userId },
        include: { license: true },
      });

      if (!userLicense) {
        // Create a BASIC license for addon purchases
        const licenseKey = generateLicenseKey();
        const newLicense = await tx.license.create({
          data: {
            licenseKey,
            type: "BASIC",
            status: "ACTIVE",
            maxAssessments: 0,
            maxUsers: 1,
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });

        userLicense = await tx.userLicense.create({
          data: {
            userId,
            licenseId: newLicense.id,
            isActive: true,
            assessmentsAllowed: 0,
            assessmentsUsed: 0,
            conversationalReportsAllowed: 1, // Give 1 conversational credit
            conversationalReportsUsed: 0,
            lastCreditsRefreshedAt: new Date(),
          },
          include: { license: true },
        });

        console.log(
          `[PaymentService] ✅ Created new license with 1 conversational credit for user: ${userId}`
        );
      } else {
        // Increment conversational assessment credits for existing user license
        const updatedUserLicense = await tx.userLicense.update({
          where: { id: userLicense.id },
          data: {
            conversationalReportsAllowed: {
              increment: 1,
            },
          },
          include: { license: true },
        });

        console.log(
          `[PaymentService] ✅ Incremented conversational credits for user ${userId}: ${updatedUserLicense.conversationalReportsAllowed - 1} → ${updatedUserLicense.conversationalReportsAllowed}`
        );
        userLicense = updatedUserLicense;
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          userId,
          stripePaymentIntentId: session.payment_intent as string,
          stripeCustomerId: session.customer as string,
          amount: 900, // $9.00
          currency: "usd",
          status: "SUCCEEDED",
          planType: "conversational_addon",
          plan: "Conversational Assessment Addon",
          metadata: {
            sessionId: session.id,
            productType: "conversational_addon",
          } as any,
        },
      });

      console.log(
        `[PaymentService] ✅ Conversational addon purchased for user: ${userId}`
      );

      // Ensure license relation is present
      let license = userLicense.license;
      if (!license) {
        license = await tx.license.findUnique({ where: { id: userLicense.licenseId } });
      }
      return { user, payment, license, userLicense };
    });
  }

  /**
   * Process assessment/subscription purchase
   */
  private async processAssessmentPurchase(session: Stripe.Checkout.Session) {
    console.log(`[PaymentService] Processing assessment purchase`);

    // Transaction ensures all-or-nothing
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get or create user
      const user = await this.getOrCreateUser(session, tx);
      console.log(`[PaymentService] User resolved: ${user.id}`);

      // 2. Create payment record
      const payment = await this.createPaymentRecord(session, user.id, tx);
      console.log(`[PaymentService] Payment created: ${payment.id}`);

      // 3. Create or update license
      const license = await this.createOrUpdateLicense(user.id, session, tx);
      console.log(`[PaymentService] License created/updated: ${license.id}`);

      return { user, payment, license };
    });

    // 4. Generate one-time login token for auto-login
    const loginToken = await loginTokenService.generateToken(result.user.id);
    console.log(
      `[PaymentService] Login token generated: ${loginToken.substring(0, 8)}...`
    );

    return { ...result, loginToken };
  }

  /**
   * Get existing user or create new one from session metadata
   */
  private async getOrCreateUser(
    session: Stripe.Checkout.Session,
    tx: Prisma.TransactionClient
  ) {
    const { userId, userEmail, userName, userPasswordHash } =
      session.metadata || {};

    // If userId provided, fetch existing user
    if (userId) {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
      });

      // Activate if not already active
      if (!user.isActive) {
        return tx.user.update({
          where: { id: userId },
          data: { isActive: true },
        });
      }

      return user;
    }

    // Anonymous checkout - create or find user by email
    if (!userEmail) {
      throw new Error("No user identifier provided in checkout session");
    }

    // Check if user exists
    const existingUser = await tx.user.findUnique({
      where: { email: userEmail },
    });

    if (existingUser) {
      // User already exists - just activate and return
      console.log(
        `[PaymentService] User already exists: ${userEmail}, activating...`
      );

      if (!existingUser.isActive) {
        return tx.user.update({
          where: { id: existingUser.id },
          data: { isActive: true },
        });
      }

      return existingUser;
    }

    // Create new user
    if (!userPasswordHash) {
      throw new Error("Password required for new user registration");
    }

    console.log(`[PaymentService] Creating new user: ${userEmail}`);

    // First, create the user in Supabase Auth with a secure random password
    const { createClient } = await import("@supabase/supabase-js");
    const { randomBytes } = await import("crypto");

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if user already exists in Supabase Auth
    const { data: existingAuthUsers } =
      await supabaseAdmin.auth.admin.listUsers();
    let authUser = existingAuthUsers?.users.find((u) => u.email === userEmail);

    if (!authUser) {
      // Generate a secure random password for Supabase (user won't need this - we'll use magic links)
      const supabasePassword = randomBytes(32).toString("hex");

      // Create user in Supabase Auth
      const { data: newAuthUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: userEmail,
          password: supabasePassword,
          email_confirm: true, // Auto-confirm email since they paid
          user_metadata: {
            name: userName || null,
            created_via: "stripe_checkout",
          },
        });

      if (authError) {
        console.error(
          `[PaymentService] Failed to create user in Supabase Auth:`,
          authError
        );
        throw new Error(
          `Failed to create user in authentication system: ${authError.message}`
        );
      }

      authUser = newAuthUser.user;
      console.log(
        `[PaymentService] User created in Supabase Auth: ${authUser.id}`
      );
    } else {
      console.log(
        `[PaymentService] User already exists in Supabase Auth: ${authUser.id}`
      );
    }

    // Now create in Prisma database with the Supabase user ID
    return tx.user.create({
      data: {
        id: authUser.id, // Use Supabase user ID for consistency
        email: userEmail,
        name: userName || null,
        password: userPasswordHash, // Store the original bcrypt hash for reference
        role: "USER",
        isActive: true,
      },
    });
  }

  /**
   * Create payment record
   */
  private async createPaymentRecord(
    session: Stripe.Checkout.Session,
    userId: string,
    tx: Prisma.TransactionClient
  ) {
    const { assessmentType, plan, source, childName, planType } =
      session.metadata || {};

    return tx.payment.create({
      data: {
        userId,
        stripePaymentIntentId: session.payment_intent as string,
        stripeCustomerId: session.customer as string,
        amount: session.amount_total ?? session.amount_subtotal ?? 0,
        currency: session.currency || "usd",
        status: "SUCCEEDED",
        planType: assessmentType || plan || "basic",
        plan: this.getPlanName(assessmentType || plan),
        childName: childName || null,
        metadata: {
          sessionId: session.id,
          source: source || "checkout",
          planType: planType || "oneTime",
        } as any,
      },
    });
  }

  /**
   * Create or update user's license
   */
  private async createOrUpdateLicense(
    userId: string,
    session: Stripe.Checkout.Session,
    tx: Prisma.TransactionClient
  ) {
    const existingUserLicense = await tx.userLicense.findFirst({
      where: { userId },
      include: { license: true },
    });

    if (existingUserLicense) {
      console.log(
        `[PaymentService] 🔍 Found existing license for user ${userId}:`,
        {
          licenseId: existingUserLicense.id,
          currentAllowed: existingUserLicense.assessmentsAllowed,
          currentUsed: existingUserLicense.assessmentsUsed,
        }
      );

      // Increment assessments allowed for existing user license
      const updatedUserLicense = await tx.userLicense.update({
        where: { id: existingUserLicense.id },
        data: {
          assessmentsAllowed: {
            increment: 1,
          },
        },
      });

      console.log(
        `[PaymentService] ✅ Incremented credits for user ${userId}:`,
        {
          before: existingUserLicense.assessmentsAllowed,
          after: updatedUserLicense.assessmentsAllowed,
        }
      );

      // Also update the license itself
      return tx.license.update({
        where: { id: existingUserLicense.license.id },
        data: {
          maxAssessments: {
            increment: 1,
          },
          status: "ACTIVE",
        },
      });
    }

    // Create new license
    console.log(`[PaymentService] 🆕 Creating new license for user ${userId}`);

    const licenseKey = generateLicenseKey();
    const newLicense = await tx.license.create({
      data: {
        licenseKey,
        type: "BASIC",
        status: "ACTIVE",
        maxAssessments: 1,
        maxUsers: 1,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    // Create user license with 1 assessment allowed
    const newUserLicense = await tx.userLicense.create({
      data: {
        userId,
        licenseId: newLicense.id,
        isActive: true,
        assessmentsAllowed: 1, // Each $97 purchase gives 1 assessment
        assessmentsUsed: 0,
        lastCreditsRefreshedAt: new Date(),
      },
      include: { license: true },
    });

    console.log(
      `[PaymentService] ✅ Created new license for user ${userId}:`,
      {
        licenseId: newLicense.id,
        userLicenseId: newUserLicense.id,
        assessmentsAllowed: 1,
      }
    );

    return newLicense;
  }

  /**
   * Process subscription checkout (Core / Family plans)
   * The actual license provisioning happens on invoice events; here we simply
   * ensure the user exists and their Stripe customer ID is stored for later use.
   */
  private async processSubscriptionCheckout(session: Stripe.Checkout.Session) {
    const { userId } = session.metadata || {};
    if (!userId) {
      throw new Error("User ID required for subscription checkout");
    }

    const stripeCustomerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
      });

      if (stripeCustomerId && user.stripeCustomerId !== stripeCustomerId) {
        await tx.user.update({
          where: { id: userId },
          data: { stripeCustomerId },
        });
        console.log(
          `[PaymentService] Linked Stripe customer ${stripeCustomerId} to user ${userId}`
        );
      }

      return { user };
    });
  }

  /**
   * Get human-readable plan name
   */
  private getPlanName(type?: string): string {
    if (!type) return "Single Assessment";
    return getAssessmentDisplayName(type);
  }
}

export const paymentService = new PaymentService();
