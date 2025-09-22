/**
 * License Enforcement Middleware
 *
 * Protects routes and actions based on user licenses
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { LicensingService } from "@/lib/licensing/licensing-service";

export interface LicenseMiddlewareOptions {
  requiredAction?:
    | "create_assessment"
    | "generate_pdf"
    | "use_api"
    | "bulk_upload";
  adminOnly?: boolean;
  redirectOnFailure?: string;
}

/**
 * License enforcement middleware factory
 */
export function withLicense(options: LicenseMiddlewareOptions = {}) {
  return async function licenseMiddleware(
    handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
    request: NextRequest,
    ...args: any[]
  ): Promise<NextResponse> {
    try {
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check admin requirement
      if (options.adminOnly && session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      // For non-admin users, check license
      if (session.user.role !== "ADMIN") {
        const hasActiveLicense = await LicensingService.hasActiveLicense(
          session.user.id
        );

        if (!hasActiveLicense) {
          return NextResponse.json(
            {
              error: "Active license required",
              code: "NO_LICENSE",
            },
            { status: 403 }
          );
        }

        // Check specific action permission
        if (options.requiredAction) {
          const actionResult = await LicensingService.canPerformAction(
            session.user.id,
            options.requiredAction
          );

          if (!actionResult.allowed) {
            return NextResponse.json(
              {
                error: actionResult.reason || "Action not permitted",
                code: "ACTION_NOT_PERMITTED",
              },
              { status: 403 }
            );
          }
        }
      }

      // Proceed with the original handler
      return await handler(request, ...args);
    } catch (error) {
      console.error("License middleware error:", error);
      return NextResponse.json(
        { error: "License validation failed" },
        { status: 500 }
      );
    }
  };
}

/**
 * Track usage after successful action
 */
export async function trackUsage(
  userId: string,
  action: "create_assessment" | "generate_pdf" | "use_api"
): Promise<void> {
  try {
    const usageMap = {
      create_assessment: "assessments",
      generate_pdf: "pdfReports",
      use_api: "apiCalls",
    } as const;

    const usageType = usageMap[action];
    if (usageType) {
      await LicensingService.trackUsage(userId, usageType);
    }
  } catch (error) {
    console.error("Usage tracking error:", error);
    // Don't throw - tracking failure shouldn't break the main functionality
  }
}

/**
 * Helper function to create license-protected route handlers
 */
export function createLicensedHandler<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options: LicenseMiddlewareOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const licensedHandler = withLicense(options);
    return await licensedHandler(handler, request, ...args);
  };
}
