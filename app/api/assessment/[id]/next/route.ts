import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/assessment/:id/next
 * Returns the next question for the assessment
 * For TRIAL mode: returns trial questions only (isTrial=true)
 * For FULL mode: returns all questions, skipping already-answered
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessmentId = id;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        assessmentTemplate: {
          include: {
            domains: {
              include: {
                domainTemplate: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
        responses: {
          select: { questionId: true },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (!assessment.assessmentTemplate) {
      return NextResponse.json(
        { error: "Assessment template not found" },
        { status: 404 }
      );
    }

    // Flatten all questions from template domains
    const allQuestions = assessment.assessmentTemplate.domains.flatMap(
      (domain: any, domainIndex: number) => {
        const domainQuestions = domain.domainTemplate.questions as any[];
        return domainQuestions.map((question: any, questionIndex: number) => ({
          id: question.id,
          text: question.text,
          order: domainIndex * 100 + questionIndex,
          domain: domain.domainTemplate.name,
          domainSlug: domain.domainTemplate.slug,
          isTrial: question.isTrial || false,
          active: question.active !== false,
        }));
      }
    );

    // Filter based on assessment mode
    let availableQuestions = allQuestions.filter((q: any) => q.active);

    if (assessment.mode === "TRIAL") {
      availableQuestions = availableQuestions.filter((q: any) => q.isTrial);
    }

    // Sort by order
    availableQuestions.sort((a: any, b: any) => a.order - b.order);

    // Get answered question IDs
    const answeredIds = new Set(
      assessment.responses.map((r) => r.questionId)
    );

    // Find next unanswered question
    const nextQuestion = availableQuestions.find(
      (q: any) => !answeredIds.has(q.id)
    );

    // Calculate progress
    const totalQuestions = availableQuestions.length;
    const answeredCount = Array.from(answeredIds).filter((id) =>
      availableQuestions.some((q: any) => q.id === id)
    ).length;
    const progressPercent = Math.round(
      (answeredCount / totalQuestions) * 100
    );
    const etaMinutes = Math.ceil((totalQuestions - answeredCount) * 0.5); // 30s per question

    // Determine phase
    const isDone = !nextQuestion;
    let phase: "trial" | "full" | "done" = "done";
    if (!isDone) {
      phase = assessment.mode === "TRIAL" ? "trial" : "full";
    }

    const response: any = {
      assessmentId,
      phase,
      progress: {
        answered: answeredCount,
        required: totalQuestions,
        percent: progressPercent,
        etaMinutes,
      },
    };

    if (nextQuestion) {
      response.next = {
        qid: nextQuestion.id,
        text: nextQuestion.text,
        scale: "yesno", // Currently only yes/no supported
        context: {
          domain: nextQuestion.domain,
          order: nextQuestion.order,
        },
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[assessment/[id]/next] failed", error);
    return NextResponse.json(
      { error: "Failed to get next question" },
      { status: 500 }
    );
  }
}
