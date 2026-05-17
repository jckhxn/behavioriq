import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/admin/users/[id]/credits - Assign credits to a user
 * Super Admin only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await request.json();
    const {
      assessmentCredits,
      conversationalCredits,
      conversationalReportCredits = conversationalCredits,
    } = body;

    if (
      (assessmentCredits !== undefined &&
        typeof assessmentCredits !== "number") ||
      (conversationalReportCredits !== undefined &&
        typeof conversationalReportCredits !== "number")
    ) {
      return NextResponse.json(
        { error: "Invalid credit values" },
        { status: 400 }
      );
    }

    // Get user's active license
    const userLicense = await prisma.userLicense.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!userLicense) {
      return NextResponse.json(
        { error: "User has no active license" },
        { status: 404 }
      );
    }

    // Update credits
    const updateData: any = {};

    if (assessmentCredits !== undefined) {
      updateData.assessmentsAllowed = {
        increment: assessmentCredits,
      };
    }

    if (conversationalReportCredits !== undefined) {
      updateData.conversationalReportsAllowed = {
        increment: conversationalReportCredits,
      };
    }

    const updatedLicense = await prisma.userLicense.update({
      where: { id: userLicense.id },
      data: updateData,
    });

    console.log(
      `[Admin] ✅ ${user.email} assigned credits to user ${userId}:`,
      { assessmentCredits, conversationalReportCredits }
    );

    return NextResponse.json({
      success: true,
      updatedLicense: {
        assessmentsAllowed: updatedLicense.assessmentsAllowed,
        assessmentsUsed: updatedLicense.assessmentsUsed,
        conversationalReportsAllowed:
          updatedLicense.conversationalReportsAllowed,
        conversationalReportsUsed:
          updatedLicense.conversationalReportsUsed,
      },
    });
  } catch (error) {
    console.error("Error assigning credits:", error);
    return NextResponse.json(
      { error: "Failed to assign credits" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]/credits - Set absolute credit values
 * Super Admin only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await request.json();
    const {
      assessmentsAllowed,
      assessmentsUsed,
      conversationalReportsAllowed,
      conversationalReportsUsed,
    } = body;

    // Get user's active license
    const userLicense = await prisma.userLicense.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!userLicense) {
      return NextResponse.json(
        { error: "User has no active license" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (assessmentsAllowed !== undefined)
      updateData.assessmentsAllowed = assessmentsAllowed;
    if (assessmentsUsed !== undefined)
      updateData.assessmentsUsed = assessmentsUsed;
    if (conversationalReportsAllowed !== undefined)
      updateData.conversationalReportsAllowed = conversationalReportsAllowed;
    if (conversationalReportsUsed !== undefined)
      updateData.conversationalReportsUsed = conversationalReportsUsed;

    const updatedLicense = await prisma.userLicense.update({
      where: { id: userLicense.id },
      data: updateData,
    });

    console.log(
      `[Admin] ✅ ${user.email} set absolute credits for user ${userId}:`,
      updateData
    );

    return NextResponse.json({
      success: true,
      updatedLicense: {
        assessmentsAllowed: updatedLicense.assessmentsAllowed,
        assessmentsUsed: updatedLicense.assessmentsUsed,
        conversationalReportsAllowed:
          updatedLicense.conversationalReportsAllowed,
        conversationalReportsUsed:
          updatedLicense.conversationalReportsUsed,
      },
    });
  } catch (error) {
    console.error("Error setting credits:", error);
    return NextResponse.json(
      { error: "Failed to set credits" },
      { status: 500 }
    );
  }
}
