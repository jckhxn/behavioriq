import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { licenseType } = await request.json();
    const { id } = await params;

    if (!licenseType || !["BASIC", "PROFESSIONAL", "ENTERPRISE"].includes(licenseType)) {
      return NextResponse.json(
        { error: "Invalid license type" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        licenses: {
          where: { isActive: true },
          include: { license: true },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the license template for the requested type
    const licenseTemplate = await prisma.license.findFirst({
      where: { type: licenseType },
    });

    if (!licenseTemplate) {
      return NextResponse.json(
        { error: "License template not found" },
        { status: 404 }
      );
    }

    // Check if user has an active license
    const activeLicense = targetUser.licenses[0];

    if (activeLicense) {
      // Update existing license
      await prisma.userLicense.update({
        where: { id: activeLicense.id },
        data: {
          licenseId: licenseTemplate.id,
          // Optionally preserve existing credit balances or reset to license defaults
          assessmentsAllowed: licenseTemplate.maxAssessments || 0,
          conversationalAssessmentsAllowed:
            licenseTemplate.maxConversationalAssessments || 0,
          conversationalReportsAllowed:
            licenseTemplate.maxConversationalReports || 0,
        },
      });
    } else {
      // Create new license for user
      await prisma.userLicense.create({
        data: {
          userId: targetUser.id,
          licenseId: licenseTemplate.id,
          isActive: true,
          assessmentsAllowed: licenseTemplate.maxAssessments || 0,
          assessmentsUsed: 0,
          conversationalAssessmentsAllowed:
            licenseTemplate.maxConversationalAssessments || 0,
          conversationalAssessmentsUsed: 0,
          conversationalReportsAllowed:
            licenseTemplate.maxConversationalReports || 0,
          conversationalReportsUsed: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `License updated to ${licenseType}`,
    });
  } catch (error) {
    console.error("Error updating license:", error);
    return NextResponse.json(
      { error: "Failed to update license" },
      { status: 500 }
    );
  }
}
