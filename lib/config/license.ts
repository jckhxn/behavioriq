import { SUBSCRIPTION_PLANS } from "./pricing";

const coreMonthlyPlan = SUBSCRIPTION_PLANS.CORE_MONTHLY;
const coreAnnualPlan = SUBSCRIPTION_PLANS.CORE_ANNUAL;
const familyMonthlyPlan = SUBSCRIPTION_PLANS.FAMILY_MONTHLY;
const familyAnnualPlan = SUBSCRIPTION_PLANS.FAMILY_ANNUAL;

/**
 * License configuration and rules
 */
export const LICENSE_CONFIG = {
  FREE_TRIAL: {
    type: "FREE_TRIAL" as const,
    maxAssessments: 0,
    maxUsers: 1,
    validityDays: 30,
    features: [
      "10 parent-only screening questions",
      "Instant snapshot summary",
      "Limited dashboard preview",
      "Upgrade CTA to unlock full assessment",
    ] as const,
    canPurchase: true,
    conversationalAISessions: 0,
  },
  FREE: {
    type: "FREE" as const,
    maxAssessments: 0,
    maxUsers: 1,
    validityDays: null,
    features: ["View assessment summaries"],
    canPurchase: true,
  },
  BASIC: {
    type: "BASIC" as const,
    maxAssessments: 0, // View-only, increments with each $97 purchase
    maxUsers: 1,
    validityDays: null, // Permanent access
    features: [
      "Full assessment dashboard access",
      "School-ready PDF download",
    ],
    canPurchase: true, // Can purchase additional assessments or upgrade
  },
  MONTHLY_LITE: {
    type: "MONTHLY_LITE" as const,
    maxAssessments: 2,
    maxUsers: 1,
    validityDays: null,
    creditsPerInterval: 1,
    creditIntervalMonths: 1,
    rolloverCap: 2,
    features: [
      "1 assessment credit per month",
      "Snapshot dashboard access",
      "School-ready PDF",
      "Basic resource library",
    ] as const,
    canPurchase: true,
    conversationalAISessions: 0,
  },
  CORE: {
    type: "CORE" as const,
    maxAssessments: coreMonthlyPlan.rolloverCap,
    maxUsers: 1,
    validityDays: null,
    creditsPerInterval: coreMonthlyPlan.creditsPerInterval,
    creditIntervalMonths: coreMonthlyPlan.creditIntervalMonths,
    rolloverCap: coreMonthlyPlan.rolloverCap,
    features: [...coreMonthlyPlan.features, "priority_support"] as const,
    canPurchase: true,
    conversationalAISessions: 0,
  },
  ANNUAL_CORE: {
    type: "ANNUAL_CORE" as const,
    maxAssessments: coreAnnualPlan.rolloverCap,
    maxUsers: 1,
    validityDays: null,
    creditsPerInterval: coreAnnualPlan.creditsPerInterval,
    creditIntervalMonths: coreAnnualPlan.creditIntervalMonths,
    rolloverCap: coreAnnualPlan.rolloverCap,
    features: [...coreAnnualPlan.features, "priority_support"] as const,
    canPurchase: true,
    conversationalAISessions: 0,
  },
  FAMILY: {
    type: "FAMILY" as const,
    maxAssessments: familyMonthlyPlan.rolloverCap,
    maxUsers: 1,
    validityDays: null,
    creditsPerInterval: familyMonthlyPlan.creditsPerInterval,
    creditIntervalMonths: familyMonthlyPlan.creditIntervalMonths,
    rolloverCap: familyMonthlyPlan.rolloverCap,
    features: [
      ...familyMonthlyPlan.features,
      "Unlimited conversational AI sessions",
      "Priority live chat support",
    ] as const,
    canPurchase: true,
    conversationalAISessions: null, // Unlimited included
  },
  ANNUAL_FAMILY: {
    type: "ANNUAL_FAMILY" as const,
    maxAssessments: familyAnnualPlan.rolloverCap,
    maxUsers: 1,
    validityDays: null,
    creditsPerInterval: familyAnnualPlan.creditsPerInterval,
    creditIntervalMonths: familyAnnualPlan.creditIntervalMonths,
    rolloverCap: familyAnnualPlan.rolloverCap,
    features: [
      ...familyAnnualPlan.features,
      "Unlimited conversational AI sessions",
      "Priority live chat support",
    ] as const,
    canPurchase: true,
    conversationalAISessions: null, // Unlimited included
  },
  PROFESSIONAL: {
    type: "PROFESSIONAL" as const,
    maxAssessments: null, // Unlimited
    maxUsers: 1,
    validityDays: null, // Based on subscription
    features: [
      "Unlimited assessments",
      "School-ready PDF reports",
      "Enhanced reports included",
      "Conversational AI sessions included",
      "Priority support",
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
      "Unlimited assessments",
      "Parent and child assessment modes",
      "Enhanced reports included",
      "Conversational AI for staff",
      "SIS/PowerSchool integration",
      "Bulk import tools",
      "District admin dashboard",
    ],
    canPurchase: false, // Enterprise - contact sales
    conversationalAISessions: null, // Unlimited for districts
  },
  PARENT_PILOT: {
    type: "PARENT_PILOT" as const,
    maxAssessments: null,
    maxUsers: null,
    validityDays: 90,
    features: [
      "Unlimited assessments during pilot",
      "Parent and child assessment modes",
      "Quarterly aggregate usage reports",
      "Basic district dashboard",
      "Parent communication toolkit",
    ] as const,
    canPurchase: false,
    conversationalAISessions: null,
  },
  DISTRICT_PILOT: {
    type: "DISTRICT_PILOT" as const,
    maxAssessments: null,
    maxUsers: null,
    validityDays: 90,
    features: [
      "Unlimited assessments during pilot",
      "Parent and child assessment modes",
      "Admin dashboard with baseline analytics",
      "Staff onboarding session",
      "Compliance toolkit",
      "Parent communication templates",
      "Priority email support",
      "Performance guarantee (50% backlog reduction)",
    ] as const,
    canPurchase: false,
    conversationalAISessions: null,
  },
  DISTRICT_STANDARD: {
    type: "DISTRICT_STANDARD" as const,
    maxAssessments: null,
    maxUsers: null,
    validityDays: 365,
    features: [
      "Unlimited assessments under Fair Use",
      "Parent and child modes",
      "Enhanced reports included",
      "District analytics dashboard",
      "Basic SIS/PowerSchool integration support",
      "Staff training curriculum",
      "Compliance support & documentation",
      "Behavioral trend analytics",
      "IEP/504/RTI export tools",
      "Role-based permissions",
      "Quarterly compliance updates",
      "24-hour email support",
    ] as const,
    canPurchase: false,
    conversationalAISessions: null,
  },
  DISTRICT_PROFESSIONAL: {
    type: "DISTRICT_PROFESSIONAL" as const,
    maxAssessments: null,
    maxUsers: null,
    validityDays: 365,
    features: [
      "Unlimited assessments under Fair Use",
      "Parent and child modes",
      "Enhanced reports included",
      "Advanced analytics dashboard",
      "Full SIS/PowerSchool integration support",
      "Multi-school admin hierarchy",
      "Monthly professional development workshops",
      "Priority phone and email support",
      "Trend analytics & exports",
      "Role-based permissions",
    ] as const,
    canPurchase: false,
    conversationalAISessions: null,
  },
  DISTRICT_ENTERPRISE: {
    type: "DISTRICT_ENTERPRISE" as const,
    maxAssessments: null,
    maxUsers: null,
    validityDays: 365,
    features: [
      "Unlimited assessments under Fair Use",
      "Parent and child modes",
      "Enhanced reports included",
      "Enterprise analytics dashboard",
      "Custom SIS/API integration support",
      "Multi-school admin hierarchy",
      "Dedicated account manager",
      "Custom API integrations",
      "White-label options",
      "Quarterly board-ready ROI reports",
      "On-site training",
      "Custom feature consideration",
    ] as const,
    canPurchase: false,
    conversationalAISessions: null,
  },
  DISCOUNTED_CORE: {
    type: "DISCOUNTED_CORE" as const,
    maxAssessments: coreMonthlyPlan.rolloverCap,
    maxUsers: 1,
    validityDays: null,
    creditsPerInterval: coreMonthlyPlan.creditsPerInterval,
    creditIntervalMonths: coreMonthlyPlan.creditIntervalMonths,
    rolloverCap: coreMonthlyPlan.rolloverCap,
    features: [...coreMonthlyPlan.features, "Founders pricing applied"] as const,
    canPurchase: true,
    conversationalAISessions: 0,
  },
  DISCOUNTED_FAMILY: {
    type: "DISCOUNTED_FAMILY" as const,
    maxAssessments: familyMonthlyPlan.rolloverCap,
    maxUsers: 1,
    validityDays: null,
    creditsPerInterval: familyMonthlyPlan.creditsPerInterval,
    creditIntervalMonths: familyMonthlyPlan.creditIntervalMonths,
    rolloverCap: familyMonthlyPlan.rolloverCap,
    features: [...familyMonthlyPlan.features, "Founders pricing applied"] as const,
    canPurchase: true,
    conversationalAISessions: null,
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
