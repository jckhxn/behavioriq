import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  TrialStartRequestSchema,
  TrialStartResponseSchema,
} from "@/lib/api/chatgpt/schemas";
import {
  publicEndpointMiddleware,
  createErrorResponse,
} from "@/lib/api/chatgpt/middleware";
import questions from "@/lib/api/chatgpt/questions.json";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/trial/start
 * Start a trial assessment session (public, no auth required)
 */
export async function POST(request: NextRequest) {
  const requestId = uuidv4();

  try {
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
    const validationResult = TrialStartRequestSchema.safeParse(body);
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

    const { childAge, relationshipType } = validationResult.data;

    // Generate session ID
    const sessionId = `trial_${uuidv4()}`;

    // Get trial questions (15 total: 3 per domain)
    const trialQuestions = questions.trial;

    if (!trialQuestions || trialQuestions.length !== 15) {
      console.error(
        "Trial questions configuration error: expected 15 questions"
      );
      return createErrorResponse(
        "Internal server error",
        "INTERNAL_ERROR",
        requestId,
        500
      );
    }

    // Create TrialSession in database
    try {
      await prisma.trialSession.create({
        data: {
          id: sessionId,
          childAge,
          relationshipType,
          status: "started",
          questions: JSON.stringify(trialQuestions.map((q) => q.id)),
          answers: JSON.stringify([]),
        },
      });
    } catch (error) {
      console.error("[Trial Start] Database error:", error);
      return createErrorResponse(
        "Failed to create trial session",
        "DATABASE_ERROR",
        requestId,
        500
      );
    }

    // Format response
    const responseBody = TrialStartResponseSchema.parse({
      sessionId,
      questions: trialQuestions.map((q) => ({
        questionId: q.id,
        text: q.text,
        domain: q.domain,
      })),
      totalQuestions: 15,
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
    console.error("[Trial Start] Unexpected error:", errorMessage);

    return createErrorResponse(
      "Internal server error",
      "INTERNAL_ERROR",
      requestId,
      500
    );
  }
}
