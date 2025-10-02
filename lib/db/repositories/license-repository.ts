import { prisma } from "@/lib/db/prisma";
import type { License, UserLicense, Prisma } from "@prisma/client";
import {
  LICENSE_CONFIG,
  calculateExpirationDate,
  generateLicenseKey,
  type LicenseType,
} from "@/lib/config/license";

export class LicenseRepository {
  /**
   * Create a new license
   */
  async create(
    type: LicenseType,
    customConfig?: Partial<Prisma.LicenseCreateInput>
  ): Promise<License> {
    const config = LICENSE_CONFIG[type];
    const licenseKey = generateLicenseKey();
    const validUntil = calculateExpirationDate(type);

    return prisma.license.create({
      data: {
        licenseKey,
        type: config.type as any,
        status: "ACTIVE",
        maxAssessments: config.maxAssessments,
        maxUsers: config.maxUsers ?? undefined,
        validUntil,
        ...customConfig,
      },
    });
  }

  /**
   * Find license by key
   */
  async findByKey(licenseKey: string): Promise<License | null> {
    return prisma.license.findUnique({
      where: { licenseKey },
    });
  }

  /**
   * Find license by ID
   */
  async findById(id: string): Promise<License | null> {
    return prisma.license.findUnique({
      where: { id },
    });
  }

  /**
   * Assign license to user
   */
  async assignToUser(licenseId: string, userId: string): Promise<UserLicense> {
    return prisma.userLicense.create({
      data: {
        licenseId,
        userId,
        isActive: true,
      },
    });
  }

  /**
   * Get active licenses for user
   */
  async findActiveLicensesForUser(userId: string) {
    return prisma.userLicense.findMany({
      where: {
        userId,
        isActive: true,
        license: {
          status: "ACTIVE",
        },
      },
      include: {
        license: true,
      },
    });
  }

  /**
   * Get first active license for user
   */
  async findFirstActiveLicenseForUser(userId: string) {
    return prisma.userLicense.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        license: true,
      },
    });
  }

  /**
   * Increment assessment count
   */
  async incrementAssessments(licenseId: string): Promise<License> {
    return prisma.license.update({
      where: { id: licenseId },
      data: {
        maxAssessments: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Update license status
   */
  async updateStatus(
    licenseId: string,
    status: "ACTIVE" | "SUSPENDED" | "CANCELLED"
  ): Promise<License> {
    return prisma.license.update({
      where: { id: licenseId },
      data: { status },
    });
  }

  /**
   * Update license
   */
  async update(
    licenseId: string,
    data: Prisma.LicenseUpdateInput
  ): Promise<License> {
    return prisma.license.update({
      where: { id: licenseId },
      data,
    });
  }

  /**
   * Check if user has available assessment slots
   */
  async hasAvailableAssessments(userId: string): Promise<boolean> {
    const licenses = await this.findActiveLicensesForUser(userId);

    // Unlimited assessments (null maxAssessments)
    if (licenses.some((ul) => ul.license.maxAssessments === null)) {
      return true;
    }

    // Check if any license has remaining assessments
    const totalAvailable = licenses.reduce((sum, ul) => {
      return sum + (ul.license.maxAssessments || 0);
    }, 0);

    // Count used assessments
    const usedCount = await prisma.assessment.count({
      where: { userId },
    });

    return totalAvailable > usedCount;
  }
}

export const licenseRepository = new LicenseRepository();
