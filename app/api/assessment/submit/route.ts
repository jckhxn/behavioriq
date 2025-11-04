import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  AssessmentSubmitRequestSchema,
  AssessmentSubmitResponseSchema,
} from "@/lib/api/chatgpt/schemas";
import {
  authenticatedEndpointMiddleware,
  createErrorResponse,
} from "@/lib/api/chatgpt/middleware";
import { v4 as uuidv4 } from "uuid";

/**
 * Answer scoring: map answer values to points
 */
const ANSWER_SCORES: Record<string, number> = {
  never: 0,
  rarely: 1,
  sometimes: 2,
  often: 3,
  very_often: 4,
};

/**
 * POST /api/assessment/submit
 * Submit full assessment answers (requires X-API-Key authentication)
 */
export async function POST(request: NextRequest) {
  const requestId = uuidv4();

  try {
    // Apply authentication middleware
    const { context, error } = await authenticatedEndpointMiddleware(request);

    if (error) {
      return error;
    }

    if (!context.userId) {
      return createErrorResponse(
        "User context missing",
        "AUTH_ERROR",
        requestId,
        401
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return createErrorResponse(
        "Invalid JSON in request body",
        "INVALID_REQUEST",
        requestId,
        400
      );
    }

    // Validate request against schema
    const validationResult = AssessmentSubmitRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");

      return createErrorResponse(
        `Validation failed: ${errors}`,
        "VALIDATION_ERROR",
        requestId,
        400
      );
    }

    const { assessmentId, answers } = validationResult.data;

    // Fetch assessment from database
    let assessment;
    try {
      assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });
    } catch (error) {
      console.error("[Assessment Submit] Database error:", error);
      return createErrorResponse(
        "Failed to fetch assessment",
        "DATABASE_ERROR",
        requestId,
        500
      );
    }

    if (!assessment) {
      return createErrorResponse(
        "Assessment not found",
        "ASSESSMENT_NOT_FOUND",
        requestId,
        404
      );
    }

    // Verify assessment belongs to authenticated user
    if (assessment.userId !== context.userId) {
      return createErrorResponse(
        "Assessment does not belong to authenticated user",
        "AUTH_MISMATCH",
        requestId,
        403
      );
    }

    // Verify assessment is in progress
    if (assessment.status !== "IN_PROGRESS") {
      return createErrorResponse(
        `Assessment is already ${assessment.status.toLowerCase()}`,
        "ASSESSMENT_INVALID_STATE",
        requestId,
        400
      );
    }

    // Store answers and calculate scores
    try {
      // Create question responses
      for (const answer of answers) {
        const score = ANSWER_SCORES[answer.answer] ?? 0;
        await prisma.questionResponse.create({
          data: {
            id: uuidv4(),
            assessmentId,
            questionId: answer.questionId,
            response: answer.answer,
            score,
          },
        });
      }

      // Calculate domain scores from answers
      const domainScores: Record<string, { total: number; count: number }> = {
        attention: { total: 0, count: 0 },
        emotional: { total: 0, count: 0 },
        social: { total: 0, count: 0 },
        behavioral: { total: 0, count: 0 },
        learning: { total: 0, count: 0 },
      };

      // Group answers by domain and calculate sums
      const responses = await prisma.questionResponse.findMany({
        where: { assessmentId },
        include: {
          question: {
            select: { text: true }, // We'll extract domain from questionId pattern
          },
        },
      });

      // Map questionId to domain (e.g., q_attention_1 -> attention)
      for (const response of responses) {
        const domainMatch = response.questionId.match(/^q_(\w+)_\d+$/);
        if (domainMatch) {
          const domain = domainMatch[1] as keyof typeof domainScores;
          if (domain in domainScores) {
            domainScores[domain].total += response.score;
            domainScores[domain].count += 1;
          }
        }
      }

      // Create score records for each domain
      for (const [domain, scores] of Object.entries(domainScores)) {
        if (scores.count > 0) {
          // Maximum score per domain: 15 questions × 4 points = 60
          const rawScore = scores.total;
          const percentile = Math.round((rawScore / 60) * 100);

          await prisma.score.create({
            data: {
              id: uuidv4(),
              assessmentId,
              domain,
              score: rawScore,
              percentile,
            },
          });
        }
      }

      // Update assessment status to completed
      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("[Assessment Submit] Processing error:", error);
      return createErrorResponse(
        "Failed to process assessment submission",
        "PROCESSING_ERROR",
        requestId,
        500
      );
    }

    // Format response
    const responseBody = AssessmentSubmitResponseSchema.parse({
      assessmentId,
      status: "completed",
      message: `Assessment ${assessmentId} has been successfully submitted and scored.`,
    });

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[Assessment Submit] Unexpected error:", errorMessage);

    return createErrorResponse(
      "Internal server error",
      "INTERNAL_ERROR",
      requestId,
      500
    );
  }
}
