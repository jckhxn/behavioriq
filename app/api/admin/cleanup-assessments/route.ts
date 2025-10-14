import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

/**
 * Admin endpoint to cleanup orphaned/invalid assessments
 * This checks for assessments with missing required data and removes them
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    // Only allow super admins to run cleanup
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    console.log("[Cleanup] Starting assessment cleanup...");

    // Find all assessments
    const allAssessments = await prisma.assessment.findMany({
      select: {
        id: true,
        shortId: true,
        userId: true,
        status: true,
        subjectName: true,
        startedAt: true,
      },
    });

    console.log(`[Cleanup] Found ${allAssessments.length} total assessments`);

    // Find assessments with null/missing shortIds
    const invalidAssessments = allAssessments.filter((a) => !a.shortId);

    console.log(
      `[Cleanup] Found ${invalidAssessments.length} assessments with missing shortIds`
    );

    if (invalidAssessments.length > 0) {
      // Delete assessments with missing shortIds
      const deleteResult = await prisma.assessment.deleteMany({
        where: {
          id: {
            in: invalidAssessments.map((a) => a.id),
          },
        },
      });

      console.log(
        `[Cleanup] Deleted ${deleteResult.count} invalid assessments`
      );

      return NextResponse.json({
        success: true,
        message: "Cleanup completed",
        deletedCount: deleteResult.count,
        deletedAssessments: invalidAssessments.map((a) => ({
          id: a.id,
          subjectName: a.subjectName,
          status: a.status,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "No invalid assessments found",
      deletedCount: 0,
    });
  } catch (error) {
    console.error("[Cleanup] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to cleanup assessments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
