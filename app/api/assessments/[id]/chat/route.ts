import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { AssessmentAI } from "@/lib/ai/AssessmentAI";
import { ASSESSMENT_CONFIG } from "@/lib/config/ai-config";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

const structuredResponseSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  response: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Invalid assessment chat payload:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const payload = (body ?? {}) as Record<string, unknown>;
    const message =
      typeof payload.message === "string" ? payload.message : null;
    const providedAssessmentId =
      typeof payload.assessmentId === "string" ? payload.assessmentId : null;

    const identifier = (await params).id;
    let assessmentId = providedAssessmentId;

    if (!assessmentId) {
      assessmentId = await resolveAssessmentId(identifier, user.id);
    }

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
        id: true,
        status: true,
        isConversational: true,
        assessmentTemplateId: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment is already completed" },
        { status: 400 }
      );
    }

    // Initialize AssessmentAI
    const assessmentAI = new AssessmentAI(assessment.id);
    await assessmentAI.initialize();

    const isStructuredMode = ASSESSMENT_CONFIG.CURRENT_MODE === "structured";

    if (isStructuredMode) {
      if (message === "start_assessment") {
        const initialQuestion =
          await assessmentAI.getInitialStructuredQuestion();

        if (!initialQuestion) {
          return NextResponse.json(
            { error: "Failed to get initial question" },
            { status: 500 }
          );
        }

        const progress = await assessmentAI.getCurrentProgress();

        return NextResponse.json({
          message:
            "Welcome to the behavioral assessment. You'll be asked a series of yes/no questions across different behavioral domains. Please answer honestly - there are no right or wrong answers.",
          nextQuestion: initialQuestion.text,
          questionId: initialQuestion.questionId,
          currentDomain: initialQuestion.domain,
          scores: [],
          isComplete: false,
          progress,
          resolvedAssessmentId: assessment.id,
        });
      }

      if (message === "resume_assessment") {
        const nextQuestion = await assessmentAI.getNextQuestion();

        if (!nextQuestion) {
          return NextResponse.json(
            { error: "Failed to get next question" },
            { status: 500 }
          );
        }

        const progress = await assessmentAI.getCurrentProgress();

        return NextResponse.json({
          message: "Resuming assessment...",
          nextQuestion: nextQuestion.text,
          questionId: nextQuestion.questionId,
          currentDomain: nextQuestion.domain,
          scores: [],
          isComplete: false,
          progress,
          resolvedAssessmentId: assessment.id,
        });
      }

      if (message === "previous_question") {
        const previousQuestion = await assessmentAI.getPreviousQuestion();

        if (!previousQuestion) {
          return NextResponse.json(
            { error: "No previous question available" },
            { status: 400 }
          );
        }

        const progress = await assessmentAI.getCurrentProgress();

        return NextResponse.json({
          message: "Going back...",
          previousQuestion: previousQuestion.text,
          questionId: previousQuestion.questionId,
          currentDomain: previousQuestion.domain,
          progress,
          resolvedAssessmentId: assessment.id,
        });
      }

      const structuredValidation =
        structuredResponseSchema.safeParse(payload);
      if (!structuredValidation.success) {
        return NextResponse.json(
          { error: structuredValidation.error.errors[0].message },
          { status: 400 }
        );
      }

      const response = await assessmentAI.processStructuredResponse(
        structuredValidation.data
      );
      return NextResponse.json({
        ...response,
        resolvedAssessmentId: assessment.id,
      });
    }

    return NextResponse.json(
      { error: "Only structured assessment mode is supported" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Assessment chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
