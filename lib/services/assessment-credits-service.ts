// import { LicenseType } from "@prisma/client";
import { LICENSE_CONFIG } from "@/lib/config/license";
import { addMonths } from "date-fns";
import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
const userLicenseInclude = {
  license: {
    select: { type: true, maxConversationalReports: true },
  },
};

// Use Prisma's generated type for userLicense with license select
// TypeScript will infer the type from Prisma calls
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
  private getSubscriptionCreditSettings(type: string) {
    const config = (LICENSE_CONFIG as Record<string, any>)[type];
    if (!config) return null;

    const creditsPerInterval = config.creditsPerInterval ?? 0;
    if (!creditsPerInterval || creditsPerInterval <= 0) {
      return null;
    }

    const creditIntervalMonths = config.creditIntervalMonths ?? 1;
    const rolloverCap =
      config.rolloverCap === undefined ? null : config.rolloverCap;

    return {
      creditsPerInterval,
      creditIntervalMonths,
      rolloverCap,
    };
  }

  private async refreshSubscriptionCredits(userLicense: any): Promise<any> {
    const settings = this.getSubscriptionCreditSettings(
      userLicense.license.type
    );

    if (!settings) {
      return userLicense;
    }

    if (settings.creditIntervalMonths <= 0) {
      return userLicense;
    }

    const baseReference =
      userLicense.lastCreditsRefreshedAt ??
      userLicense.assignedAt ??
      new Date();
    const now = new Date();
    let lastApplied = baseReference;
    let intervals = 0;

    while (true) {
      const candidate = addMonths(lastApplied, settings.creditIntervalMonths);
      if (candidate <= now) {
        intervals += 1;
        lastApplied = candidate;
      } else {
        break;
      }
    }

    if (intervals <= 0 && userLicense.lastCreditsRefreshedAt) {
      return userLicense;
    }

    const creditsToAdd = intervals * (settings.creditsPerInterval ?? 0);
    const currentRemaining = Math.max(
      0,
      userLicense.assessmentsAllowed - userLicense.assessmentsUsed
    );

    let newRemaining = currentRemaining;
    if (creditsToAdd > 0) {
      if (settings.rolloverCap === null) {
        newRemaining = currentRemaining + creditsToAdd;
      } else {
        newRemaining = Math.min(
          settings.rolloverCap,
          currentRemaining + creditsToAdd
        );
      }
    }

    const newAssessmentsAllowed = userLicense.assessmentsUsed + newRemaining;

    if (
      newAssessmentsAllowed === userLicense.assessmentsAllowed &&
      userLicense.lastCreditsRefreshedAt &&
      lastApplied.getTime() === userLicense.lastCreditsRefreshedAt.getTime()
    ) {
      return userLicense;
    }

    return prisma.userLicense.update({
      where: { id: userLicense.id },
      data: {
        assessmentsAllowed: newAssessmentsAllowed,
        lastCreditsRefreshedAt: lastApplied,
      },
      include: {
        license: {
          select: { type: true, maxConversationalReports: true },
        },
      },
    });
  }

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
    const settings = this.getSubscriptionCreditSettings(type);
    if (settings && settings.rolloverCap !== null) {
      return settings.rolloverCap ?? null;
    }

    switch (type) {
      case "BASIC":
        return 6;
      case "FREE_TRIAL":
      case "FREE":
        return 0;
      case "DISTRICT_PILOT":
      case "DISTRICT_STANDARD":
      case "DISTRICT_PROFESSIONAL":
      case "DISTRICT_ENTERPRISE":
      case "PROFESSIONAL":
      case "ENTERPRISE":
        return null;
      case "MONTHLY_LITE":
        return 2;
      default:
        return null;
    }
  }

  /**
   * Get the next credit earning date for the user
   */
  async getNextCreditDate(userId: string): Promise<string | null> {
    const userLicense = await prisma.userLicense.findFirst({
      where: { userId, isActive: true },
      select: {
        id: true,
        assignedAt: true,
        lastCreditsRefreshedAt: true,
        license: { select: { type: true } },
      },
    });

    if (!userLicense) {
      return null;
    }

    const settings = this.getSubscriptionCreditSettings(
      userLicense.license.type
    );

    if (!settings) {
      return null;
    }

    const baseReference =
      userLicense.lastCreditsRefreshedAt ??
      userLicense.assignedAt ??
      new Date();
    const nextGrant = addMonths(baseReference, settings.creditIntervalMonths);
    return nextGrant.toISOString();
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
    let userLicense = await prisma.userLicense.findFirst({
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

    userLicense = await this.refreshSubscriptionCredits(userLicense);

    if (!userLicense) {
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

    // Calculate conversational credits (reports)
    const conversationalCreditsRemaining = Math.max(
      0,
      (userLicense.conversationalReportsAllowed ?? 0) -
        (userLicense.conversationalReportsUsed ?? 0)
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
        conversationalCreditsUsed: userLicense.conversationalReportsUsed ?? 0,
        conversationalCreditsAllowed: userLicense.conversationalReportsAllowed,
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
      conversationalCreditsUsed: userLicense.conversationalReportsUsed ?? 0,
      conversationalCreditsAllowed: userLicense.conversationalReportsAllowed,
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
