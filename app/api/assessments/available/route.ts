import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

// GET /api/assessments/available - Get active assessment templates for REGISTERED users only
// This endpoint should NEVER return trial assessments - those are only for anonymous users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get full user details including organizational structure
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, parentUserId: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(
      `[ASSESSMENTS/AVAILABLE] User ${currentUser.id} (${currentUser.role}) requesting available assessments`
    );

    // Get platform settings to find the trial assessment ID (to exclude it)
    const platformSettings = await (prisma as any).platformSettings.findFirst({
      select: {
        globalTrialAssessmentId: true,
      },
    });

    // Build the where clause for active assessments
    let whereClause: any = {
      isActive: true,
    };

    // CRITICAL: Exclude the trial assessment from regular user results
    if (platformSettings?.globalTrialAssessmentId) {
      whereClause.id = { not: platformSettings.globalTrialAssessmentId };
      console.log(
        `[ASSESSMENTS/AVAILABLE] Excluding trial assessment ID: ${platformSettings.globalTrialAssessmentId}`
      );
    }

    // Simplified approach: For now, show all active assessments (regardless of creator)
    // This matches the "mark as active" workflow you want
    console.log(
      `[ASSESSMENTS/AVAILABLE] Looking for all active assessments (excluding trial)`
    );

    // Get active assessment templates (excluding trial assessments)
    const activeAssessments = await (prisma as any).assessmentTemplate.findMany(
      {
        where: whereClause,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          instructions: true,
          createdAt: true,
          domains: {
            select: {
              domainTemplate: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
              order: true,
            },
            orderBy: { order: "asc" },
          },
          _count: {
            select: {
              assessments: true, // Count how many users have taken this assessment
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }
    );

    console.log(
      `[ASSESSMENTS/AVAILABLE] Found ${activeAssessments.length} active assessments for user ${currentUser.id}`
    );
    console.log(
      `[ASSESSMENTS/AVAILABLE] Assessment IDs: ${activeAssessments
        .map((a: any) => `${a.id} (${a.name})`)
        .join(", ")}`
    );

    return NextResponse.json(activeAssessments);
  } catch (error) {
    console.error("Error fetching available assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch available assessments" },
      { status: 500 }
    );
  }
}
