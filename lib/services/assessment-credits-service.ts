/**
 * Assessment Credits Service
 * Handles checking and managing assessment allowances for BASIC users
 */

import { prisma } from "@/lib/db/prisma";

export interface AssessmentCreditsInfo {
  hasCredits: boolean;
  creditsRemaining: number;
  creditsAllowed: number;
  creditsUsed: number;
  licenseType: string;
  // Conversational assessment credits
  conversationalCredits?: number;
  conversationalCreditsUsed?: number;
  conversationalCreditsAllowed?: number;
}

export class AssessmentCreditsService {
  /**
   * Check if a user has available assessment credits
   * Returns credit info for display
   */
  async checkUserCredits(userId: string): Promise<AssessmentCreditsInfo> {
    // Get user's active license
    const userLicense = await prisma.userLicense.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        license: true,
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    if (!userLicense) {
      // No license - no credits
      return {
        hasCredits: false,
        creditsRemaining: 0,
        creditsAllowed: 0,
        creditsUsed: 0,
        licenseType: "NONE",
        conversationalCredits: 0,
        conversationalCreditsUsed: 0,
        conversationalCreditsAllowed: 0,
      };
    }

    const licenseType = userLicense.license.type;

    // Calculate conversational credits
    const conversationalCreditsRemaining = Math.max(
      0,
      userLicense.conversationalAssessmentsAllowed - userLicense.conversationalAssessmentsUsed
    );

    // PROFESSIONAL and ENTERPRISE have unlimited assessments
    if (licenseType === "PROFESSIONAL" || licenseType === "ENTERPRISE") {
      return {
        hasCredits: true,
        creditsRemaining: Infinity,
        creditsAllowed: Infinity,
        creditsUsed: userLicense.assessmentsUsed,
        licenseType,
        conversationalCredits: conversationalCreditsRemaining,
        conversationalCreditsUsed: userLicense.conversationalAssessmentsUsed,
        conversationalCreditsAllowed: userLicense.conversationalAssessmentsAllowed,
      };
    }

    // TRIAL license type removed - no longer used
    // Legacy TRIAL users should have been migrated to BASIC
    // if (licenseType === "TRIAL") {
    //   const creditsRemaining = Math.max(0, 1 - userLicense.assessmentsUsed);
    //   return {
    //     hasCredits: creditsRemaining > 0,
    //     creditsRemaining,
    //     creditsAllowed: 1,
    //     creditsUsed: userLicense.assessmentsUsed,
    //     licenseType,
    //   };
    // }

    // BASIC users have pay-per-assessment credits
    const creditsRemaining = Math.max(
      0,
      userLicense.assessmentsAllowed - userLicense.assessmentsUsed
    );

    return {
      hasCredits: creditsRemaining > 0,
      creditsRemaining,
      creditsAllowed: userLicense.assessmentsAllowed,
      creditsUsed: userLicense.assessmentsUsed,
      licenseType,
      conversationalCredits: conversationalCreditsRemaining,
      conversationalCreditsUsed: userLicense.conversationalAssessmentsUsed,
      conversationalCreditsAllowed: userLicense.conversationalAssessmentsAllowed,
    };
  }

  /**
   * Use one assessment credit
   * Throws error if no credits available
   */
  async useCredit(userId: string): Promise<void> {
    const credits = await this.checkUserCredits(userId);

    if (!credits.hasCredits) {
      throw new Error("No assessment credits available");
    }

    // Don't increment for unlimited users
    if (
      credits.licenseType === "PROFESSIONAL" ||
      credits.licenseType === "ENTERPRISE"
    ) {
      return;
    }

    // Increment used count
    await prisma.userLicense.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        assessmentsUsed: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Add credits to a user's account (for admin or purchase)
   */
  async addCredits(userId: string, amount: number): Promise<void> {
    const userLicense = await prisma.userLicense.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        license: true,
      },
    });

    if (!userLicense) {
      throw new Error("User has no active license");
    }

    await prisma.userLicense.update({
      where: {
        id: userLicense.id,
      },
      data: {
        assessmentsAllowed: {
          increment: amount,
        },
      },
    });

    // Also update the license maxAssessments
    await prisma.license.update({
      where: {
        id: userLicense.licenseId,
      },
      data: {
        maxAssessments: {
          increment: amount,
        },
      },
    });
  }

  /**
   * Get credits info for display in UI
   * Returns formatted strings for display
   */
  async getCreditsDisplay(userId: string): Promise<{
    text: string;
    remaining: number | "unlimited";
    showPurchase: boolean;
  }> {
    const credits = await this.checkUserCredits(userId);

    if (
      credits.licenseType === "PROFESSIONAL" ||
      credits.licenseType === "ENTERPRISE"
    ) {
      return {
        text: "Unlimited Assessments",
        remaining: "unlimited",
        showPurchase: false,
      };
    }

    // TRIAL license type removed - no longer used
    // if (credits.licenseType === "TRIAL") {
    //   return {
    //     text: `${credits.creditsRemaining} Trial Assessment Remaining`,
    //     remaining: credits.creditsRemaining,
    //     showPurchase: credits.creditsRemaining === 0,
    //   };
    // }

    if (credits.licenseType === "BASIC") {
      const text =
        credits.creditsRemaining === 1
          ? "1 Assessment Credit Remaining"
          : `${credits.creditsRemaining} Assessment Credits Remaining`;

      return {
        text,
        remaining: credits.creditsRemaining,
        showPurchase: credits.creditsRemaining === 0,
      };
    }

    return {
      text: "No Credits Available",
      remaining: 0,
      showPurchase: true,
    };
  }
}

export const assessmentCreditsService = new AssessmentCreditsService();
