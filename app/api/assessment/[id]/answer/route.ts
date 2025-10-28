import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface AnswerPayload {
  qid: string;
  value: number | string | boolean;
}

/**
 * POST /api/assessment/:id/answer
 * Submits an answer to a question
 * Converts boolean (Y/N) to numeric value and saves to QuestionResponse
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessmentId = id;
    const body = (await request.json()) as AnswerPayload;
    const { qid, value } = body;

    if (!qid || value === undefined) {
      return NextResponse.json(
        { error: "qid and value are required" },
        { status: 400 }
      );
    }

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

    // Convert to boolean response
    let boolValue = false;
    if (typeof value === "boolean") {
      boolValue = value;
    } else if (typeof value === "number") {
      boolValue = value !== 0;
    } else if (typeof value === "string") {
      boolValue = value.toLowerCase() === "y" || value.toLowerCase() === "yes" || value === "1" || value === "true";
    }

    // Save the response (upsert to handle rapid submissions)
    // If the same question is answered twice quickly, use the latest response
    await prisma.questionResponse.upsert({
      where: {
        assessmentId_questionId: {
          assessmentId,
          questionId: qid,
        },
      },
      update: {
        response: boolValue,
      },
      create: {
        assessmentId,
        questionId: qid,
        response: boolValue,
      },
    });

    // Get all questions to calculate progress
    const allQuestions = assessment.assessmentTemplate.domains.flatMap(
      (domain: any, domainIndex: number) => {
        const domainQuestions = domain.domainTemplate.questions as any[];
        return domainQuestions.map((question: any, questionIndex: number) => ({
          id: question.id,
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

    // Get all answered question IDs (including the one just submitted)
    const answeredIds = new Set(
      assessment.responses.map((r) => r.questionId)
    );
    answeredIds.add(qid); // Add the just-answered question

    const totalQuestions = availableQuestions.length;
    const answeredCount = Array.from(answeredIds).filter((id) =>
      availableQuestions.some((q: any) => q.id === id)
    ).length;

    const isDone = answeredCount >= totalQuestions;
    const progressPercent = Math.round(
      (answeredCount / totalQuestions) * 100
    );

    // Mark assessment as completed when all questions are answered
    if (isDone && assessment.status === "IN_PROGRESS") {
      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      isDone,
      progress: {
        answered: answeredCount,
        required: totalQuestions,
        percent: progressPercent,
      },
    });
  } catch (error) {
    console.error("[assessment/[id]/answer] failed", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
