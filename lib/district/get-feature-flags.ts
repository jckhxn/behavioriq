import {
  getEnabledFeatures,
  isFeatureEnabled,
  FeatureFlags,
} from "@/lib/district/feature-flags";
import { Role } from "@prisma/client";

/**
 * Server-side function to get feature flag status for use in Server Components
 *
 * @example
 * const flags = await getFeatureFlags(user.role, user.organizationId);
 *
 * return (
 *   <FeatureGate flagKey="ai_recommendations" isEnabled={flags.ai_recommendations}>
 *     <AIComponent />
 *   </FeatureGate>
 * );
 */
export async function getFeatureFlags(
  userRole?: Role,
  organizationId?: string
): Promise<Record<string, boolean>> {
  const enabledKeys = await getEnabledFeatures(userRole, organizationId);

  // Convert array to object for easier access
  const flags: Record<string, boolean> = {};

  // Check all known feature flags
  for (const [_, flagKey] of Object.entries(FeatureFlags)) {
    flags[flagKey] = enabledKeys.includes(flagKey);
  }

  return flags;
}

/**
 * Server-side function to check a single feature flag
 */
export async function checkFeature(
  flagKey: string,
  userRole?: Role,
  organizationId?: string
): Promise<boolean> {
  const result = await isFeatureEnabled(flagKey, userRole, organizationId);
  return result.enabled;
}
