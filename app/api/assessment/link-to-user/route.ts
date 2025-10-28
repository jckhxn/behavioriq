import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/assessment/link-to-user
 * Links an anonymous assessment to a newly created user account
 *
 * This is called after a user creates an account to transfer their
 * anonymous assessment results to their new account.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - user not authenticated" },
        { status: 401 }
      );
    }

    const { assessmentId } = await request.json();

    if (!assessmentId) {
      return NextResponse.json(
        { error: "assessmentId is required" },
        { status: 400 }
      );
    }

    // Check if the assessment exists and is currently anonymous
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: null, // Must be anonymous
        mode: "FULL", // Must be paid (full assessment)
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found or already linked to a user" },
        { status: 404 }
      );
    }

    // Link the assessment to the user
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      assessment: updatedAssessment,
      message: "Assessment successfully linked to your account",
    });
  } catch (error) {
    console.error("[link-to-user] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to link assessment to account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
