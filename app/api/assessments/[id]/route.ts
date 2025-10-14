import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { getAssessmentByIdentifier } from "@/lib/utils/assessmentResolver";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assessmentId } = await params;

    const assessment = await getAssessmentByIdentifier(assessmentId, user.id);

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Assessment fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

// DELETE /api/assessments/[id] - Delete an assessment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("[Delete Assessment] Request received");
  try {
    const user = await getCurrentUserWithRole();
    console.log("[Delete Assessment] User authenticated:", {
      userId: user?.id,
      email: user?.email,
    });

    if (!user) {
      console.error("[Delete Assessment] Unauthorized - no user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log("[Delete Assessment] Assessment ID:", id);

    // Super admins can delete any assessment, regular users only their own
    let existing;
    if (user.role === "SUPER_ADMIN") {
      console.log("[Delete Assessment] Super admin - skipping ownership check");
      // Super admin can delete any assessment - just resolve by shortId or UUID
      const where = id.includes("-")
        ? { shortId: id }
        : { id };
      existing = await prisma.assessment.findFirst({ where });
    } else {
      // Regular user - verify ownership
      existing = await getAssessmentByIdentifier(id, user.id);
    }

    if (!existing) {
      console.error("[Delete Assessment] Assessment not found:", {
        id,
        userId: user.id,
        role: user.role,
      });
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const internalId = existing.id;
    console.log("[Delete Assessment] Found assessment:", {
      identifier: id,
      internalId,
      status: existing.status,
    });

    // Delete related records first (due to foreign key constraints)
    console.log(
      "[Delete Assessment] Starting transaction to delete related records"
    );
    await prisma.$transaction(async (tx) => {
      // Delete chat messages
      const deletedMessages = await tx.chatMessage.deleteMany({
        where: { assessmentId: internalId },
      });
      console.log(
        "[Delete Assessment] Deleted chat messages:",
        deletedMessages.count
      );

      // Delete scores
      const deletedScores = await tx.score.deleteMany({
        where: { assessmentId: internalId },
      });
      console.log("[Delete Assessment] Deleted scores:", deletedScores.count);

      // Delete recommendations
      // @ts-ignore - Temporary workaround for Prisma type issue
      const deletedRecommendations = await tx.recommendation.deleteMany({
        where: { assessmentId: internalId },
      });
      console.log(
        "[Delete Assessment] Deleted recommendations:",
        deletedRecommendations.count
      );

      // Delete shareable links
      const deletedLinks = await tx.shareableLink.deleteMany({
        where: { assessmentId: internalId },
      });
      console.log(
        "[Delete Assessment] Deleted shareable links:",
        deletedLinks.count
      );

      // Delete the assessment
      await tx.assessment.delete({
        where: { id: internalId },
      });
      console.log("[Delete Assessment] Deleted assessment");
    });

    // ✅ NO REFUND LOGIC NEEDED - Credits are charged on completion, not on creation
    // Deleting an IN_PROGRESS assessment doesn't affect credits since no credit was charged yet
    console.log(
      `[Delete Assessment] Status: ${existing.status} - No credit refund needed (credits charged on completion only)`
    );

    console.log(
      "[Delete Assessment] Successfully deleted assessment:",
      internalId
    );
    return NextResponse.json({
      success: true,
      refunded: existing.status === "IN_PROGRESS",
    });
  } catch (error) {
    console.error("[Delete Assessment] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[Delete Assessment] Error details:", {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: "Failed to delete assessment",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
