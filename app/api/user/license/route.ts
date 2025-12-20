import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/user/license
 * Returns the current user's active license information
 * Used by components to check license type and permissions
 */
export async function GET() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's active license
    const userLicense = await prisma.userLicense.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        license: true,
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    if (!userLicense) {
      // No active license
      return NextResponse.json({
        type: "NONE",
        isActive: false,
        assessmentsAllowed: 0,
        assessmentsUsed: 0,
        conversationalReportsAllowed: null,
        conversationalReportsUsed: 0,
      });
    }

    return NextResponse.json({
      type: userLicense.license.type,
      isActive: userLicense.isActive,
      assessmentsAllowed: userLicense.assessmentsAllowed,
      assessmentsUsed: userLicense.assessmentsUsed,
      conversationalReportsAllowed: userLicense.conversationalReportsAllowed,
      conversationalReportsUsed: userLicense.conversationalReportsUsed ?? 0,
      assignedAt: userLicense.assignedAt,
    });
  } catch (error) {
    console.error("[/api/user/license] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch license data" },
      { status: 500 }
    );
  }
}
