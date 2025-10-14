import { NextRequest, NextResponse } from "next/server";
import { databaseSessionStore } from "@/lib/ai/conversational/DatabaseSessionStore";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

/**
 * Abandon a conversational assessment session
 * This marks the assessment as ABANDONED and deletes the session,
 * allowing the user to restart from scratch
 */
export async function POST(request: NextRequest) {
  try {
    const { assessmentId } = await request.json();

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify this assessment belongs to the user
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { userId: true, status: true, isConversational: true },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to abandon this assessment" },
        { status: 403 }
      );
    }

    if (!assessment.isConversational) {
      return NextResponse.json(
        { error: "This is not a conversational assessment" },
        { status: 400 }
      );
    }

    if (assessment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot abandon a completed assessment" },
        { status: 400 }
      );
    }

    // Get the session to check if it exists
    const existingSession = await databaseSessionStore.getByAssessmentId(assessmentId);

    // Mark assessment as abandoned
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: "ABANDONED" },
    });

    // Delete the conversational session if it exists
    if (existingSession) {
      await databaseSessionStore.delete(existingSession.id);
      console.log(`[Conversational] 🗑️ Deleted session ${existingSession.id} for abandoned assessment ${assessmentId}`);
    }

    console.log(`[Conversational] ⚠️ Assessment ${assessmentId} marked as ABANDONED by user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Assessment abandoned successfully",
      assessmentId,
    });
  } catch (error) {
    console.error("Error abandoning conversational assessment:", error);
    return NextResponse.json(
      { error: "Failed to abandon assessment" },
      { status: 500 }
    );
  }
}
