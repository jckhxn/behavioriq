import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { LICENSE_CONFIG, generateLicenseKey } from "@/lib/config/license";

const UNLIMITED_INT = 2147483647;

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
    const { id: targetUserId } = await params;

    if (!licenseType || !(licenseType in LICENSE_CONFIG)) {
      return NextResponse.json({ error: "Invalid license type" }, { status: 400 });
    }

    const config = LICENSE_CONFIG[licenseType as keyof typeof LICENSE_CONFIG];

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const assessmentsAllowed =
      config.maxAssessments === null ? UNLIMITED_INT : (config.maxAssessments ?? 0);

    const conversationalReportsAllowed =
      (config as any).conversationalAISessions === null
        ? UNLIMITED_INT
        : 0;

    await prisma.$transaction(async (tx) => {
      // Deactivate all existing licenses for this user
      await tx.userLicense.updateMany({
        where: { userId: targetUserId, isActive: true },
        data: { isActive: false },
      });

      // Create a fresh License record for this user
      const newLicense = await tx.license.create({
        data: {
          licenseKey: generateLicenseKey(licenseType),
          type: licenseType,
          status: "ACTIVE",
          maxAssessments: config.maxAssessments,
          maxConversationalReports:
            (config as any).conversationalAISessions === null ? null : 0,
          features: { features: config.features },
        },
      });

      // Assign the new license to the user
      await tx.userLicense.create({
        data: {
          userId: targetUserId,
          licenseId: newLicense.id,
          isActive: true,
          assessmentsAllowed,
          conversationalReportsAllowed,
          assessmentsUsed: 0,
          conversationalReportsUsed: 0,
        },
      });
    });

    console.log(`[Admin] ✅ ${user.email} assigned license ${licenseType} to user ${targetUserId}`);

    return NextResponse.json({ success: true, licenseType });
  } catch (error) {
    console.error("Error assigning license:", error);
    return NextResponse.json({ error: "Failed to assign license" }, { status: 500 });
  }
}
