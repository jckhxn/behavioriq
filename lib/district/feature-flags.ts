import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";

export interface FeatureFlagCheck {
  enabled: boolean;
  reason?: string;
}

/**
 * Check if a feature flag is enabled globally, for a specific role, or for a specific organization.
 *
 * @param flagKey - The unique key of the feature flag (e.g., 'ai_recommendations')
 * @param userRole - The user's role (optional, for role-based flags)
 * @param organizationId - The organization ID (optional, for org-based flags)
 * @returns Promise<FeatureFlagCheck> - { enabled: boolean, reason?: string }
 */
export async function isFeatureEnabled(
  flagKey: string,
  userRole?: Role,
  organizationId?: string
): Promise<FeatureFlagCheck> {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: flagKey },
    });

    // If flag doesn't exist, default to disabled
    if (!flag) {
      return { enabled: false, reason: "Feature flag not found" };
    }

    // Global flags - simple on/off
    if (flag.scope === "global") {
      return { enabled: flag.isEnabled };
    }

    // Role-based flags
    if (flag.scope === "role" && userRole) {
      const roleEnabled =
        flag.isEnabled && flag.enabledForRoles.includes(userRole);
      return {
        enabled: roleEnabled,
        reason: roleEnabled
          ? undefined
          : "Role not authorized for this feature",
      };
    }

    // Organization-based flags
    if (flag.scope === "organization" && organizationId) {
      const orgEnabled =
        flag.isEnabled && flag.enabledForOrgs.includes(organizationId);
      return {
        enabled: orgEnabled,
        reason: orgEnabled
          ? undefined
          : "Organization not authorized for this feature",
      };
    }

    // If scope requires additional context that wasn't provided
    return {
      enabled: false,
      reason: "Missing required context for feature flag",
    };
  } catch (error) {
    console.error(`Error checking feature flag ${flagKey}:`, error);
    return { enabled: false, reason: "Error checking feature flag" };
  }
}

/**
 * Get all enabled feature flags for a user context
 */
export async function getEnabledFeatures(
  userRole?: Role,
  organizationId?: string
): Promise<string[]> {
  const flags = await prisma.featureFlag.findMany({
    where: {
      isEnabled: true,
    },
  });

  const enabledKeys: string[] = [];

  for (const flag of flags) {
    const check = await isFeatureEnabled(flag.key, userRole, organizationId);
    if (check.enabled) {
      enabledKeys.push(flag.key);
    }
  }

  return enabledKeys;
}

/**
 * Feature flag keys - centralized constants to avoid typos
 */
export const FeatureFlags = {
  // District Platform
  DISTRICT_ROUTES: "district_routes",
  DISTRICT_DASHBOARD: "district_dashboard",
  TEACHER_DASHBOARD: "teacher_dashboard",

  // Role-specific features
  COUNSELOR_CASELOAD: "counselor_caseload",
  PRINCIPAL_SCHOOL_VIEW: "principal_school_view",

  // AI & Recommendations
  AI_RECOMMENDATIONS: "ai_recommendations",
  AI_CHAT: "ai_chat",

  // Reports & Exports
  PDF_EXPORT: "pdf_export",
  CSV_EXPORT: "csv_export",
  AGGREGATE_REPORTS: "aggregate_reports",

  // Student Management
  STUDENT_DETAIL_VIEW: "student_detail_view",
  STUDENT_CREATION: "student_creation",
  ASSESSMENT_ASSIGNMENT: "assessment_assignment",

  // Compliance & Privacy
  AUDIT_LOGGING: "audit_logging",
  ANONYMIZATION: "anonymization",
} as const;

export type FeatureFlagKey = (typeof FeatureFlags)[keyof typeof FeatureFlags];
