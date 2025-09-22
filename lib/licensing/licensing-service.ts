/**
 * Licensing Service
 *
 * Manages license validation, user access control, and feature flags
 */

import { prisma } from "@/lib/db/prisma";

// Type definitions
type LicenseType = "TRIAL" | "BASIC" | "PROFESSIONAL" | "ENTERPRISE";
type LicenseStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED" | "CANCELLED";

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

interface License {
  id: string;
  licenseKey: string;
  type: LicenseType;
  status: LicenseStatus;
  maxUsers: number;
  validUntil: Date | null;
  features: any;
  organizationId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserLicense {
  id: string;
  userId: string;
  licenseId: string;
  assignedBy?: string | null;
  assignedAt: Date;
  isActive: boolean;
}

export interface LicenseFeatures {
  maxAssessments?: number;
  maxPDFReports?: number;
  maxUsers?: number;
  aiRecommendations?: boolean;
  advancedReports?: boolean;
  apiAccess?: boolean;
  bulkUpload?: boolean;
  customBranding?: boolean;
  prioritySupport?: boolean;
}

export interface UserWithLicense extends User {
  licenses: (UserLicense & {
    license: License;
  })[];
  organization?: {
    id: string;
    name: string;
  } | null;
}

export class LicensingService {
  /**
   * Check if a user has an active license
   */
  static async hasActiveLicense(userId: string): Promise<boolean> {
    const userLicense = await prisma.userLicense.findFirst({
      where: {
        userId,
        isActive: true,
        license: {
          status: "ACTIVE",
          OR: [
            { validUntil: null }, // No expiration
            { validUntil: { gt: new Date() } }, // Not expired
          ],
        },
      },
      include: {
        license: true,
      },
    });

    return !!userLicense;
  }

  /**
   * Get user's active license with features
   */
  static async getUserLicense(userId: string): Promise<{
    license: License;
    features: LicenseFeatures;
  } | null> {
    const userLicense = await prisma.userLicense.findFirst({
      where: {
        userId,
        isActive: true,
        license: {
          status: "ACTIVE",
          OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
        },
      },
      include: {
        license: true,
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    if (!userLicense) return null;

    const features = this.getLicenseFeatures(userLicense.license.type);

    // Merge with custom features from license
    if (userLicense.license.features) {
      Object.assign(features, userLicense.license.features);
    }

    return {
      license: userLicense.license as any,
      features,
    };
  }

  /**
   * Get default features for a license type
   */
  static getLicenseFeatures(licenseType: LicenseType): LicenseFeatures {
    switch (licenseType) {
      case "TRIAL":
        return {
          maxAssessments: 5,
          maxPDFReports: 2,
          maxUsers: 1,
          aiRecommendations: true,
          advancedReports: false,
          apiAccess: false,
          bulkUpload: false,
          customBranding: false,
          prioritySupport: false,
        };

      case "BASIC":
        return {
          maxAssessments: 50,
          maxPDFReports: 25,
          maxUsers: 1,
          aiRecommendations: true,
          advancedReports: true,
          apiAccess: false,
          bulkUpload: false,
          customBranding: false,
          prioritySupport: false,
        };

      case "PROFESSIONAL":
        return {
          maxAssessments: 500,
          maxPDFReports: 250,
          maxUsers: 5,
          aiRecommendations: true,
          advancedReports: true,
          apiAccess: true,
          bulkUpload: true,
          customBranding: true,
          prioritySupport: true,
        };

      case "ENTERPRISE":
        return {
          maxAssessments: undefined, // Unlimited
          maxPDFReports: undefined, // Unlimited
          maxUsers: 50,
          aiRecommendations: true,
          advancedReports: true,
          apiAccess: true,
          bulkUpload: true,
          customBranding: true,
          prioritySupport: true,
        };

      default:
        return {
          maxAssessments: 0,
          maxPDFReports: 0,
          maxUsers: 0,
          aiRecommendations: false,
          advancedReports: false,
          apiAccess: false,
          bulkUpload: false,
          customBranding: false,
          prioritySupport: false,
        };
    }
  }

  /**
   * Check if user can perform an action based on their license
   */
  static async canPerformAction(
    userId: string,
    action: "create_assessment" | "generate_pdf" | "use_api" | "bulk_upload"
  ): Promise<{ allowed: boolean; reason?: string }> {
    const userLicense = await this.getUserLicense(userId);

    if (!userLicense) {
      return {
        allowed: false,
        reason:
          "No active license found. Please contact your administrator or purchase a license.",
      };
    }

    const { features } = userLicense;

    switch (action) {
      case "create_assessment":
        if (features.maxAssessments === undefined) return { allowed: true };

        const assessmentCount = await prisma.assessment.count({
          where: { userId },
        });

        if (assessmentCount >= features.maxAssessments) {
          return {
            allowed: false,
            reason: `Assessment limit reached (${features.maxAssessments}). Please upgrade your license.`,
          };
        }
        break;

      case "generate_pdf":
        if (!features.advancedReports) {
          return {
            allowed: false,
            reason: "PDF reports require a Professional or Enterprise license.",
          };
        }

        if (features.maxPDFReports === undefined) return { allowed: true };

        // Check usage metrics for current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const pdfCount = await prisma.usageMetrics.aggregate({
          where: {
            userId,
            date: { gte: startOfMonth },
          },
          _sum: { pdfReports: true },
        });

        const currentPdfCount = pdfCount._sum.pdfReports || 0;
        if (currentPdfCount >= features.maxPDFReports) {
          return {
            allowed: false,
            reason: `Monthly PDF report limit reached (${features.maxPDFReports}). Resets next month.`,
          };
        }
        break;

      case "use_api":
        if (!features.apiAccess) {
          return {
            allowed: false,
            reason: "API access requires a Professional or Enterprise license.",
          };
        }
        break;

      case "bulk_upload":
        if (!features.bulkUpload) {
          return {
            allowed: false,
            reason:
              "Bulk upload requires a Professional or Enterprise license.",
          };
        }
        break;
    }

    return { allowed: true };
  }

  /**
   * Create a new license
   */
  static async createLicense(params: {
    licenseKey?: string;
    type: LicenseType;
    maxUsers?: number;
    validUntil?: Date;
    organizationId?: string;
    features?: LicenseFeatures;
  }): Promise<License> {
    const licenseKey = params.licenseKey || this.generateLicenseKey();

    return (await prisma.license.create({
      data: {
        licenseKey,
        type: params.type,
        maxUsers: params.maxUsers || 1,
        validUntil: params.validUntil,
        organizationId: params.organizationId,
        features: params.features as any,
        status: "ACTIVE",
      },
    })) as any;
  }

  /**
   * Assign license to user
   */
  static async assignLicenseToUser(
    licenseId: string,
    userId: string,
    assignedBy?: string
  ): Promise<UserLicense> {
    // Check if license has available slots
    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      include: {
        users: { where: { isActive: true } },
      },
    });

    if (!license) {
      throw new Error("License not found");
    }

    if (license.users.length >= license.maxUsers) {
      throw new Error("License has reached maximum user limit");
    }

    // Deactivate any existing licenses for this user
    await prisma.userLicense.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Assign new license
    return await prisma.userLicense.create({
      data: {
        userId,
        licenseId,
        assignedBy,
        isActive: true,
      },
    });
  }

  /**
   * Track usage metrics
   */
  static async trackUsage(
    userId: string,
    type: "assessments" | "pdfReports" | "apiCalls",
    count: number = 1
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.usageMetrics.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        [type]: { increment: count },
      },
      create: {
        userId,
        date: today,
        [type]: count,
      },
    });
  }

  /**
   * Generate a unique license key
   */
  static generateLicenseKey(): string {
    const prefix = "AIDIA";
    const segments = [];

    for (let i = 0; i < 4; i++) {
      const segment = Math.random().toString(36).substring(2, 6).toUpperCase();
      segments.push(segment);
    }

    return `${prefix}-${segments.join("-")}`;
  }

  /**
   * Validate license key format
   */
  static isValidLicenseKeyFormat(key: string): boolean {
    const pattern = /^AIDIA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return pattern.test(key);
  }

  /**
   * Get organization licenses with usage stats
   */
  static async getOrganizationLicenses(organizationId: string): Promise<any[]> {
    return await prisma.license.findMany({
      where: { organizationId },
      include: {
        users: {
          where: { isActive: true },
          include: {
            user: {
              select: { id: true, name: true, email: true, lastLoginAt: true },
            },
          },
        },
        organization: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Check license expiration and send warnings
   */
  static async checkExpiringLicenses(): Promise<any[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return (await prisma.license.findMany({
      where: {
        status: "ACTIVE",
        validUntil: {
          lte: thirtyDaysFromNow,
          gt: new Date(),
        },
      },
      include: {
        organization: true,
        users: {
          where: { isActive: true },
          include: { user: true },
        },
      },
    })) as any;
  }
}
