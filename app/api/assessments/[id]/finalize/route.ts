import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { AssessmentAI } from "@/lib/ai/AssessmentAI";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

/**
 * POST /api/assessments/[id]/finalize
 *
 * Called by the client when it determines all questions have been answered.
 * Computes domain scores from persisted responses, saves them, marks the
 * assessment COMPLETED, and charges a credit (idempotent — credit charge is
 * guarded by an already-used check in the credits service).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = (await params).id;
    const assessmentId = await resolveAssessmentId(identifier, user.id);

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, userId: user.id },
      select: {
        id: true,
        status: true,
        isConversational: true,
        subjectName: true,
        userId: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const assessmentAI = new AssessmentAI(assessmentId);
    await assessmentAI.initialize();

    // Don't charge credit again if the assessment was already COMPLETED
    const chargeCredit = assessment.status !== "COMPLETED";
    await assessmentAI.finalizeAssessment(chargeCredit);

    const scores = await prisma.score.findMany({
      where: { assessmentId },
      select: { id: true },
    });

    return NextResponse.json({ success: true, scoresCount: scores.length });
  } catch (error) {
    console.error("[finalize] error:", error);
    return NextResponse.json(
      { error: "Failed to finalize assessment" },
      { status: 500 }
    );
  }
}
