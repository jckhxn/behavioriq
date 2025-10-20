import { prisma } from "@/lib/db/prisma";
import { LicenseType } from "@prisma/client";
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
  conversationalReportCredits?: number | null;
  conversationalReportCreditsUsed?: number;
  conversationalReportCreditsAllowed?: number | null;
}

class AssessmentCreditsService {
  /**
   * Get the rollover cap for the user's current plan
   */
  async getRolloverCap(userId: string): Promise<number | null> {
    const userLicense = await prisma.userLicense.findFirst({
      where: { userId, isActive: true },
      include: { license: { select: { type: true } } },
    });
    if (!userLicense) return null;
    const type = userLicense.license.type;
    if (type === LicenseType.FAMILY || type === LicenseType.ANNUAL_FAMILY)
      return 15;
    if (type === LicenseType.CORE || type === LicenseType.ANNUAL_CORE)
      return 6;
    if (type === LicenseType.BASIC) return 6;
    if (type === LicenseType.FREE_TRIAL) return 0;
    if (type === LicenseType.PARENT_PILOT || type === LicenseType.DISTRICT_PILOT)
      return null;
    if (
      type === LicenseType.DISTRICT_STANDARD ||
      type === LicenseType.DISTRICT_PROFESSIONAL ||
      type === LicenseType.DISTRICT_ENTERPRISE ||
      type === LicenseType.PROFESSIONAL ||
      type === LicenseType.ENTERPRISE
    )
      return null;
    if (type === LicenseType.FREE) return 0;
    return null;
  }

  /**
   * Get the next credit earning date for the user
   */
  async getNextCreditDate(userId: string): Promise<string | null> {
    // This is a placeholder. In production, calculate based on plan cycle and last grant.
    // For demo, return 1 month from now.
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    return now.toISOString();
  }

  /**
   * Get expired credits for the user (credits older than 12 months)
   */
  async getExpiredCredits(userId: string): Promise<number> {
    // Placeholder: In production, track credit grant dates and count expired ones.
    // For now, always return 0 (no expired credits).
    return 0;
  }

  // ...existing service methods (checkUserCredits, useCredit, etc.)...
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
        license: {
          select: {
            type: true,
            maxConversationalReports: true,
          },
        },
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
        conversationalReportCredits: 0,
        conversationalReportCreditsUsed: 0,
        conversationalReportCreditsAllowed: 0,
      };
    }

    const licenseType = userLicense.license.type;

    // Calculate conversational credits
    const conversationalCreditsRemaining = Math.max(
      0,
      userLicense.conversationalAssessmentsAllowed -
        userLicense.conversationalAssessmentsUsed
    );

    const manualConversationalReportAllowance =
      userLicense.conversationalReportsAllowed ?? 0;
    const licenseConversationalReportAllowance =
      userLicense.license.maxConversationalReports;
    let conversationalReportLimit: number | null;
    if (manualConversationalReportAllowance > 0) {
      conversationalReportLimit = manualConversationalReportAllowance;
    } else if (licenseConversationalReportAllowance === null) {
      conversationalReportLimit = null;
    } else if (typeof licenseConversationalReportAllowance === "number") {
      conversationalReportLimit = licenseConversationalReportAllowance;
    } else {
      conversationalReportLimit = 0;
    }
    const conversationalReportCreditsUsed =
      userLicense.conversationalReportsUsed ?? 0;
    const conversationalReportCreditsRemaining =
      conversationalReportLimit === null
        ? null
        : Math.max(
            0,
            (conversationalReportLimit ?? 0) - conversationalReportCreditsUsed
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
        conversationalCreditsAllowed:
          userLicense.conversationalAssessmentsAllowed,
        conversationalReportCredits: conversationalReportCreditsRemaining,
        conversationalReportCreditsUsed: conversationalReportCreditsUsed,
        conversationalReportCreditsAllowed: conversationalReportLimit,
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
      conversationalCreditsAllowed:
        userLicense.conversationalAssessmentsAllowed,
      conversationalReportCredits: conversationalReportCreditsRemaining,
      conversationalReportCreditsUsed: conversationalReportCreditsUsed,
      conversationalReportCreditsAllowed: conversationalReportLimit,
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
      credits.licenseType === "ENTERPRISE" ||
      credits.licenseType === "DISTRICT_STANDARD" ||
      credits.licenseType === "DISTRICT_PROFESSIONAL" ||
      credits.licenseType === "DISTRICT_ENTERPRISE" ||
      credits.licenseType === "PARENT_PILOT" ||
      credits.licenseType === "DISTRICT_PILOT"
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
      select: {
        id: true,
        licenseId: true,
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
      credits.licenseType === "ENTERPRISE" ||
      credits.licenseType === "DISTRICT_STANDARD" ||
      credits.licenseType === "DISTRICT_PROFESSIONAL" ||
      credits.licenseType === "DISTRICT_ENTERPRISE" ||
      credits.licenseType === "PARENT_PILOT" ||
      credits.licenseType === "DISTRICT_PILOT"
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
