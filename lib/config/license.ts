/**
 * License configuration and rules
 */
export const LICENSE_CONFIG = {
  FREE: {
    type: "FREE" as const,
    maxAssessments: 0, // Cannot take new assessments
    maxUsers: 1,
    validityDays: null, // Permanent
    features: ["view_assessments"], // Read-only access to past assessments
    canPurchase: true, // Can purchase single reports or upgrade
  },
  BASIC: {
    type: "BASIC" as const,
    maxAssessments: 1,
    maxUsers: 1,
    validityDays: 365,
    features: ["basic_assessment", "pdf_report"],
    canPurchase: true,
  },
  PROFESSIONAL: {
    type: "PROFESSIONAL" as const,
    maxAssessments: null, // Unlimited
    maxUsers: 1,
    validityDays: null, // Based on subscription
    features: [
      "basic_assessment",
      "pdf_report",
      "enhanced_report",
      "conversational_ai", // Included for subscriptions
      "priority_support",
    ],
    canPurchase: true,
    conversationalAISessions: null, // Unlimited for monthly/annual
  },
  ENTERPRISE: {
    type: "ENTERPRISE" as const,
    maxAssessments: null, // Unlimited
    maxUsers: null, // Unlimited
    validityDays: 365,
    features: [
      "basic_assessment",
      "pdf_report",
      "enhanced_report",
      "conversational_ai", // Included for districts
      "sis_integration",
      "bulk_import",
      "admin_dashboard",
    ],
    canPurchase: false, // Enterprise - contact sales
    conversationalAISessions: null, // Unlimited for districts
  },
  TRIAL: {
    type: "TRIAL" as const,
    maxAssessments: 1,
    maxUsers: 1,
    validityDays: null, // No expiration
    features: ["basic_assessment"], // Limited trial features
    canPurchase: true, // Can upgrade
  },
} as const;

export type LicenseType = keyof typeof LICENSE_CONFIG;

/**
 * Generate a unique license key
 */
export function generateLicenseKey(prefix: string = "LIC"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate expiration date for a license
 */
export function calculateExpirationDate(
  licenseType: LicenseType,
  customDays?: number
): Date | null {
  const config = LICENSE_CONFIG[licenseType];
  const days = customDays ?? config.validityDays;

  if (days === null) {
    return null; // No expiration for subscription-based
  }

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Check if license has a specific feature
 */
export function hasFeature(licenseType: LicenseType, feature: string): boolean {
  const config = LICENSE_CONFIG[licenseType];
  return (config.features as readonly string[]).includes(feature);
}

/**
 * Check if license can purchase reports/upgrades
 */
export function canPurchase(licenseType: LicenseType): boolean {
  const config = LICENSE_CONFIG[licenseType];
  return (config as any).canPurchase ?? false;
}

/**
 * Check if license includes conversational AI
 */
export function hasConversationalAI(licenseType: LicenseType): boolean {
  return hasFeature(licenseType, "conversational_ai");
}
