import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { AssessmentAI } from "@/lib/ai/AssessmentAI";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

export async function GET(
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
      where: {
        id: assessmentId,
        userId: user.id,
      },
      select: {
        subjectName: true,
        status: true,
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
    const snapshot = assessmentAI.getStructuredSessionSnapshot();

    return NextResponse.json({
      status: assessment.status,
      subjectName: assessment.subjectName,
      questionResponses: snapshot.questionResponses.map((response) => ({
        questionId: response.questionId,
        response: response.response,
        timestamp: response.timestamp ? response.timestamp.toISOString() : null,
      })),
      questionSets: snapshot.questionSets,
      nextQuestion: snapshot.nextQuestion,
      progress: snapshot.progress,
      assessmentId,
    });
  } catch (error) {
    console.error("Structured assessment state error:", error);
    return NextResponse.json(
      { error: "Failed to load structured assessment state" },
      { status: 500 }
    );
  }
}
