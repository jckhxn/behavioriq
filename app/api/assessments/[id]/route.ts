import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { getAssessmentByIdentifier } from "@/lib/utils/assessmentResolver";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assessmentId } = await params;

    const assessment = await getAssessmentByIdentifier(
      assessmentId,
      session.user.id
    );

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the user owns the assessment and get internal ID
    const existing = await getAssessmentByIdentifier(id, session.user.id);

    if (!existing) {
      return NextResponse.json(
        { error: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    const internalId = existing.id;

    // Delete related records first (due to foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete chat messages
      await tx.chatMessage.deleteMany({
        where: { assessmentId: internalId },
      });

      // Delete scores
      await tx.score.deleteMany({
        where: { assessmentId: internalId },
      });

      // Delete recommendations
      // @ts-ignore - Temporary workaround for Prisma type issue
      await tx.recommendation.deleteMany({
        where: { assessmentId: internalId },
      });

      // Delete the assessment
      await tx.assessment.delete({
        where: { id: internalId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}
