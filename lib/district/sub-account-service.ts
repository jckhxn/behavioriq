import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export interface CreateSubAccountData {
  email: string;
  name: string;
  displayName: string;
  description?: string;
  maxAssessments?: number;
  maxUsers?: number;
  password?: string;
}

export interface SubAccountWithUser {
  id: string;
  displayName: string;
  description?: string | null;
  maxAssessments?: number | null;
  maxUsers: number;
  isActive: boolean;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name?: string | null;
    isActive: boolean;
    lastLoginAt?: Date | null;
  };
  _count: {
    assessments: number;
  };
}

export class SubAccountService {
  /**
   * Create a new sub-account under a district admin
   */
  static async createSubAccount(
    districtAdminId: string,
    organizationId: string,
    data: CreateSubAccountData
  ): Promise<SubAccountWithUser> {
    // Verify the district admin exists and has proper role
    const districtAdmin = await prisma.user.findUnique({
      where: { id: districtAdminId },
      include: { organization: true },
    });

    if (!districtAdmin) {
      throw new Error("District admin not found");
    }

    if (
      districtAdmin.role !== Role.DISTRICT_ADMIN &&
      districtAdmin.role !== Role.ADMIN
    ) {
      throw new Error("User does not have permission to create sub-accounts");
    }

    if (districtAdmin.organizationId !== organizationId) {
      throw new Error(
        "District admin does not belong to the specified organization"
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Generate default password if not provided
    const password = data.password || this.generateDefaultPassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the sub-account user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const subUser = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: Role.SUB_ACCOUNT,
          organizationId,
          parentUserId: districtAdminId,
        },
      });

      // Create the sub-account profile
      const subAccount = await tx.subAccount.create({
        data: {
          userId: subUser.id,
          managedByUserId: districtAdminId,
          organizationId,
          displayName: data.displayName,
          description: data.description,
          maxAssessments: data.maxAssessments,
          maxUsers: data.maxUsers || 1,
        },
      });

      return { subUser, subAccount };
    });

    // Return the sub-account with user data
    return this.getSubAccountById(result.subAccount.id);
  }

  /**
   * Get all sub-accounts managed by a district admin
   */
  static async getSubAccountsForDistrictAdmin(
    districtAdminId: string,
    organizationId: string
  ): Promise<SubAccountWithUser[]> {
    const subAccounts = await prisma.subAccount.findMany({
      where: {
        managedByUserId: districtAdminId,
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get assessment counts for each sub-account
    const subAccountsWithCounts = await Promise.all(
      subAccounts.map(async (subAccount) => {
        const assessmentCount = await prisma.assessment.count({
          where: { userId: subAccount.userId },
        });

        return {
          id: subAccount.id,
          displayName: subAccount.displayName,
          description: subAccount.description,
          maxAssessments: subAccount.maxAssessments,
          maxUsers: subAccount.maxUsers,
          isActive: subAccount.isActive,
          createdAt: subAccount.createdAt,
          user: subAccount.user,
          _count: {
            assessments: assessmentCount,
          },
        };
      })
    );

    return subAccountsWithCounts;
  }

  /**
   * Get a specific sub-account by ID
   */
  static async getSubAccountById(
    subAccountId: string
  ): Promise<SubAccountWithUser> {
    const subAccount = await prisma.subAccount.findUnique({
      where: { id: subAccountId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
      },
    });

    if (!subAccount) {
      throw new Error("Sub-account not found");
    }

    // Get assessment count
    const assessmentCount = await prisma.assessment.count({
      where: { userId: subAccount.userId },
    });

    return {
      id: subAccount.id,
      displayName: subAccount.displayName,
      description: subAccount.description,
      maxAssessments: subAccount.maxAssessments,
      maxUsers: subAccount.maxUsers,
      isActive: subAccount.isActive,
      createdAt: subAccount.createdAt,
      user: subAccount.user,
      _count: {
        assessments: assessmentCount,
      },
    };
  }

  /**
   * Update a sub-account
   */
  static async updateSubAccount(
    subAccountId: string,
    districtAdminId: string,
    data: Partial<{
      displayName: string;
      description: string;
      maxAssessments: number;
      maxUsers: number;
      isActive: boolean;
    }>
  ): Promise<SubAccountWithUser> {
    // Verify ownership
    const subAccount = await prisma.subAccount.findUnique({
      where: { id: subAccountId },
    });

    if (!subAccount) {
      throw new Error("Sub-account not found");
    }

    if (subAccount.managedByUserId !== districtAdminId) {
      throw new Error("You do not have permission to update this sub-account");
    }

    // Update the sub-account
    await prisma.subAccount.update({
      where: { id: subAccountId },
      data,
    });

    return this.getSubAccountById(subAccountId);
  }

  /**
   * Deactivate a sub-account
   */
  static async deactivateSubAccount(
    subAccountId: string,
    districtAdminId: string
  ): Promise<void> {
    // Verify ownership
    const subAccount = await prisma.subAccount.findUnique({
      where: { id: subAccountId },
    });

    if (!subAccount) {
      throw new Error("Sub-account not found");
    }

    if (subAccount.managedByUserId !== districtAdminId) {
      throw new Error(
        "You do not have permission to deactivate this sub-account"
      );
    }

    // Deactivate both the sub-account and the user
    await prisma.$transaction([
      prisma.subAccount.update({
        where: { id: subAccountId },
        data: { isActive: false },
      }),
      prisma.user.update({
        where: { id: subAccount.userId },
        data: { isActive: false },
      }),
    ]);
  }

  /**
   * Reset password for a sub-account user
   */
  static async resetSubAccountPassword(
    subAccountId: string,
    districtAdminId: string,
    newPassword?: string
  ): Promise<string> {
    // Verify ownership
    const subAccount = await prisma.subAccount.findUnique({
      where: { id: subAccountId },
    });

    if (!subAccount) {
      throw new Error("Sub-account not found");
    }

    if (subAccount.managedByUserId !== districtAdminId) {
      throw new Error("You do not have permission to reset this password");
    }

    // Generate new password if not provided
    const password = newPassword || this.generateDefaultPassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user's password
    await prisma.user.update({
      where: { id: subAccount.userId },
      data: { password: hashedPassword },
    });

    return password;
  }

  /**
   * Get usage statistics for a sub-account
   */
  static async getSubAccountUsage(subAccountId: string): Promise<{
    assessmentCount: number;
    maxAssessments?: number;
    recentActivity: Date | null;
    totalUsers: number;
    maxUsers: number;
  }> {
    const subAccount = await prisma.subAccount.findUnique({
      where: { id: subAccountId },
      include: {
        user: {
          select: {
            id: true,
            lastLoginAt: true,
          },
        },
      },
    });

    if (!subAccount) {
      throw new Error("Sub-account not found");
    }

    const assessmentCount = await prisma.assessment.count({
      where: { userId: subAccount.userId },
    });

    return {
      assessmentCount,
      maxAssessments: subAccount.maxAssessments || undefined,
      recentActivity: subAccount.user.lastLoginAt,
      totalUsers: 1, // Currently each sub-account has one user
      maxUsers: subAccount.maxUsers,
    };
  }

  /**
   * Generate a default password for new sub-accounts
   */
  private static generateDefaultPassword(): string {
    const adjectives = ["Quick", "Bright", "Smart", "Fast", "Safe"];
    const nouns = ["Tiger", "Eagle", "River", "Mountain", "Star"];
    const numbers = Math.floor(Math.random() * 100);

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective}${noun}${numbers}`;
  }

  /**
   * Check if a district admin can create more sub-accounts
   */
  static async canCreateSubAccount(
    districtAdminId: string,
    organizationId: string
  ): Promise<{
    canCreate: boolean;
    reason?: string;
    currentCount: number;
    maxAllowed?: number;
  }> {
    const currentCount = await prisma.subAccount.count({
      where: {
        managedByUserId: districtAdminId,
        organizationId,
        isActive: true,
      },
    });

    // Get the district admin's license to check limits
    const districtAdmin = await prisma.user.findUnique({
      where: { id: districtAdminId },
      include: {
        licenses: {
          include: {
            license: true,
          },
        },
      },
    });

    if (!districtAdmin) {
      return {
        canCreate: false,
        reason: "District admin not found",
        currentCount,
      };
    }

    // Check license limits (you can customize this logic based on your license types)
    const activeLicense = districtAdmin.licenses.find(
      (ul) => ul.isActive
    )?.license;
    if (activeLicense) {
      // For example, limit based on license type
      let maxSubAccounts: number | undefined;

      switch (activeLicense.type) {
        case "TRIAL":
          maxSubAccounts = 2;
          break;
        case "BASIC":
          maxSubAccounts = 5;
          break;
        case "PROFESSIONAL":
          maxSubAccounts = 25;
          break;
        case "ENTERPRISE":
          maxSubAccounts = undefined; // Unlimited
          break;
      }

      if (maxSubAccounts !== undefined && currentCount >= maxSubAccounts) {
        return {
          canCreate: false,
          reason: `Maximum sub-accounts (${maxSubAccounts}) reached for ${activeLicense.type.toLowerCase()} license`,
          currentCount,
          maxAllowed: maxSubAccounts,
        };
      }

      return {
        canCreate: true,
        currentCount,
        maxAllowed: maxSubAccounts,
      };
    }

    return { canCreate: true, currentCount };
  }
}
