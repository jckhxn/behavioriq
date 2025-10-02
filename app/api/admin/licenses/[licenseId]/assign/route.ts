/**
 * License Assignment API
 *
 * Handles assigning licenses to users
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { LicensingService } from "@/lib/licensing/licensing-service";

// POST /api/admin/licenses/[licenseId]/assign - Assign license to user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ licenseId: string }> }
) {
  try {
    const { licenseId } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userLicense = await LicensingService.assignLicenseToUser(
      licenseId,
      userId,
      session.user.id
    );

    return NextResponse.json(
      {
        userLicense,
        message: "License assigned successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("License assignment error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to assign license" },
      { status: 500 }
    );
  }
}
