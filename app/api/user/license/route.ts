/**
 * User License Validation API
 *
 * Handles checking user licenses and permissions
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { LicensingService } from "@/lib/licensing/licensing-service";

// GET /api/user/license - Get current user's license information
export async function GET() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userLicense = await LicensingService.getUserLicense(user.id);

    if (!userLicense) {
      return NextResponse.json({
        hasLicense: false,
        message: "No active license found",
      });
    }

    return NextResponse.json({
      hasLicense: true,
      license: {
        type: userLicense.license.type,
        status: userLicense.license.status,
        validUntil: userLicense.license.validUntil,
        maxAssessments: userLicense.license.maxAssessments,
        features: userLicense.features,
      },
    });
  } catch (error) {
    console.error("License validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate license" },
      { status: 500 }
    );
  }
}

// POST /api/user/license/check - Check if user can perform action
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const validActions = [
      "create_assessment",
      "generate_pdf",
      "use_api",
      "bulk_upload",
    ];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: "Valid action is required" },
        { status: 400 }
      );
    }

    const result = await LicensingService.canPerformAction(user.id, action);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Action check error:", error);
    return NextResponse.json(
      { error: "Failed to check action permission" },
      { status: 500 }
    );
  }
}
