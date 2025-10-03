import { prisma } from "@/lib/db/prisma";
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

    return prisma.$transaction(async (tx) => {
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
          amount: PRICING.ENHANCED_REPORT,
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
   * Process assessment/subscription purchase
   */
  private async processAssessmentPurchase(session: Stripe.Checkout.Session) {
    console.log(`[PaymentService] Processing assessment purchase`);

    // Transaction ensures all-or-nothing
    const result = await prisma.$transaction(async (tx) => {
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
    console.log(`[PaymentService] Login token generated: ${loginToken.substring(0, 8)}...`);

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

    return tx.user.upsert({
      where: { email: userEmail },
      create: {
        email: userEmail,
        name: userName || null,
        password: userPasswordHash!,
        role: "USER",
        isActive: true,
      },
      update: {
        isActive: true, // Activate if exists
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
        amount: session.amount_total!,
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
    const existingLicense = await tx.userLicense.findFirst({
      where: { userId },
      include: { license: true },
    });

    if (existingLicense) {
      // Increment max assessments for existing license
      return tx.license.update({
        where: { id: existingLicense.license.id },
        data: {
          maxAssessments: {
            increment: 1,
          },
          status: "ACTIVE",
        },
      });
    }

    // Create new license
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

    await tx.userLicense.create({
      data: {
        userId,
        licenseId: newLicense.id,
        isActive: true,
      },
    });

    return newLicense;
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
