import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { computeSkippedQuestions } from "@/lib/assessment/skip-logic";

/**
 * GET /api/assessment/:id/next
 * Returns the next question for the assessment respecting:
 *   - TRIAL vs FULL mode (isTrial flag)
 *   - active flag per question
 *   - per-question skip logic loaded from the template
 *
 * Response includes full question metadata (weight, isGatingQuestion,
 * skipLogic) so iOS / web clients can handle branching client-side too.
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
          select: { questionId: true, response: true },
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

    // Flatten all questions from template domains, preserving full structure
    const allQuestions = assessment.assessmentTemplate.domains.flatMap(
      (domain: any, domainIndex: number) => {
        const domainQuestions = domain.domainTemplate.questions as any[];
        return domainQuestions.map((question: any, questionIndex: number) => ({
          id: question.id,
          text: question.text,
          // Prefer explicit per-question order, fall back to positional
          order:
            domainIndex * 1000 +
            (typeof question.order === "number" ? question.order : questionIndex),
          domain: domain.domainTemplate.name,
          domainSlug: domain.domainTemplate.slug,
          isTrial: question.isTrial || false,
          active: question.active !== false,
          weight: typeof question.weight === "number" ? question.weight : 1,
          isGatingQuestion: Boolean(question.isGatingQuestion),
          // Support both field names used in different template versions
          skipLogic: question.skipLogic || question.skipCondition || null,
          category: question.category || null,
        }));
      }
    );

    // Filter to questions eligible for this mode
    let availableQuestions = allQuestions.filter((q: any) => q.active);
    if (assessment.mode === "TRIAL") {
      availableQuestions = availableQuestions.filter((q: any) => q.isTrial);
    }

    // Sort by composite order (domain position × 1000 + question position)
    availableQuestions.sort((a: any, b: any) => a.order - b.order);

    // Build answer map for skip logic evaluation
    const answerMap = new Map<string, string>(
      assessment.responses.map((r) => [r.questionId, r.response])
    );

    // Compute questions that should be skipped given current answers
    const skippedIds = computeSkippedQuestions(availableQuestions, answerMap);

    // Effective questions = available minus skipped
    const effectiveQuestions = availableQuestions.filter(
      (q: any) => !skippedIds.has(q.id)
    );

    // Questions already answered
    const answeredIds = new Set(assessment.responses.map((r) => r.questionId));

    // First effective question that hasn't been answered yet
    const nextQuestion = effectiveQuestions.find(
      (q: any) => !answeredIds.has(q.id)
    );

    // Progress uses effective question count so it accounts for skips
    const totalQuestions = effectiveQuestions.length;
    const answeredCount = effectiveQuestions.filter((q: any) =>
      answeredIds.has(q.id)
    ).length;
    const progressPercent =
      totalQuestions > 0
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 100;
    const etaMinutes = Math.ceil((totalQuestions - answeredCount) * 0.5);

    const isDone = !nextQuestion;
    let phase: "trial" | "full" | "done" = "done";
    if (!isDone) {
      phase = assessment.mode === "TRIAL" ? "trial" : "full";
    }

    const responseBody: any = {
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
      responseBody.next = {
        qid: nextQuestion.id,
        text: nextQuestion.text,
        scale: "yesno",
        weight: nextQuestion.weight,
        isGatingQuestion: nextQuestion.isGatingQuestion,
        skipLogic: nextQuestion.skipLogic,
        category: nextQuestion.category,
        context: {
          domain: nextQuestion.domain,
          domainSlug: nextQuestion.domainSlug,
          order: nextQuestion.order,
        },
      };
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("[assessment/[id]/next] failed", error);
    return NextResponse.json(
      { error: "Failed to get next question" },
      { status: 500 }
    );
  }
}
