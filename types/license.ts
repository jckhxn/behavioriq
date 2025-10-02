/**
 * License-related types
 */

import type { License, LicenseStatus } from "@prisma/client";
import type { LicenseType } from "@/lib/config/license";

/**
 * License with user assignment
 */
export interface UserLicenseInfo {
  license: License;
  isActive: boolean;
  assignedAt: Date;
}

/**
 * License statistics
 */
export interface LicenseStats {
  totalLicenses: number;
  activeLicenses: number;
  suspendedLicenses: number;
  cancelledLicenses: number;
  assessmentsRemaining: number | null; // null = unlimited
}

/**
 * License creation data
 */
export interface CreateLicenseData {
  licenseKey: string;
  type: LicenseType;
  status: LicenseStatus;
  maxAssessments: number | null;
  maxUsers: number | null;
  validUntil: Date | null;
}

export type { License, LicenseStatus };
