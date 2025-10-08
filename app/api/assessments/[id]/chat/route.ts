import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
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
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = (await params).id;

    // Resolve shortId to UUID if needed
    const assessmentId = await resolveAssessmentId(identifier, user.id);
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify assessment belongs to user
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: user.id,
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

    const body = await request.json();

    // Initialize AssessmentAI
    const assessmentAI = new AssessmentAI(assessmentId);
    await assessmentAI.initialize();

    // Check assessment mode
    const isStructuredMode = ASSESSMENT_CONFIG.CURRENT_MODE === "structured";

    if (isStructuredMode) {
      // Handle structured assessment
      if (body.message === "start_assessment") {
        // Get the first question
        const initialQuestion =
          await assessmentAI.getInitialStructuredQuestion();

        if (!initialQuestion) {
          return NextResponse.json(
            { error: "Failed to get initial question" },
            { status: 500 }
          );
        }

        // Get actual progress calculation instead of hardcoded zeros
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
        });
      }

      if (body.message === "resume_assessment") {
        // Resume from where user left off
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
        });
      }

      if (body.message === "previous_question") {
        // Go back to previous question
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
        });
      }

      // Validate structured response
      const structuredValidation = structuredResponseSchema.safeParse(body);
      if (!structuredValidation.success) {
        return NextResponse.json(
          { error: structuredValidation.error.errors[0].message },
          { status: 400 }
        );
      }

      // Process structured response (only mode supported)
      const response = await assessmentAI.processStructuredResponse(
        structuredValidation.data
      );
      return NextResponse.json(response);
    } else {
      // Only structured mode is supported
      return NextResponse.json(
        { error: "Only structured assessment mode is supported" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Assessment chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
