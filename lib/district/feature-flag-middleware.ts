import { NextRequest, NextResponse } from "next/server";
import { isFeatureEnabled } from "@/lib/district/feature-flags";
import { Role } from "@prisma/client";

/**
 * Middleware wrapper to protect API routes with feature flags
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   return withFeatureFlag('ai_recommendations', request, async () => {
 *     // Your protected route logic here
 *   });
 * }
 */
export async function withFeatureFlag(
  flagKey: string,
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    userRole?: Role;
    organizationId?: string;
  }
): Promise<NextResponse> {
  const check = await isFeatureEnabled(
    flagKey,
    options?.userRole,
    options?.organizationId
  );

  if (!check.enabled) {
    return NextResponse.json(
      {
        error: "Feature not available",
        message: check.reason || "This feature is currently disabled",
      },
      { status: 403 }
    );
  }

  return handler(request);
}

/**
 * Check multiple feature flags at once
 */
export async function requireFeatureFlags(
  flagKeys: string[],
  userRole?: Role,
  organizationId?: string
): Promise<{ enabled: boolean; missing: string[] }> {
  const checks = await Promise.all(
    flagKeys.map((key) => isFeatureEnabled(key, userRole, organizationId))
  );

  const missing = flagKeys.filter((_, index) => !checks[index].enabled);

  return {
    enabled: missing.length === 0,
    missing,
  };
}
