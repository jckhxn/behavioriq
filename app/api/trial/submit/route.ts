import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  TrialSubmitRequestSchema,
  TrialSubmitResponseSchema,
} from "@/lib/api/chatgpt/schemas";
import { createErrorResponse } from "@/lib/api/chatgpt/middleware";
import questions from "@/lib/api/chatgpt/questions.json";
import { v4 as uuidv4 } from "uuid";

/**
 * Calculate domain score from answers
 */
function calculateDomainScore(
  domainAnswers: Array<{ questionId: string; answer: string }>
): number {
  // For trial (yes/no answers): yes = 2 points, no = 0 points
  // Max score per domain = 6 (3 questions × 2 points)
  return domainAnswers.reduce((sum, item) => {
    return sum + (item.answer === "yes" ? 2 : 0);
  }, 0);
}

/**
 * Determine severity level based on score (0-6 for trial)
 */
function determineSeverity(
  score: number
): "normal" | "mild" | "moderate" | "severe" {
  if (score === 0) return "normal";
  if (score <= 2) return "mild";
  if (score <= 4) return "moderate";
  return "severe";
}

/**
 * Calculate percentile based on score
 */
function calculatePercentile(score: number, maxScore: number): number {
  return Math.round((score / maxScore) * 100);
}

/**
 * POST /api/trial/submit
 * Submit trial assessment answers (public, no auth required)
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
    const validationResult = TrialSubmitRequestSchema.safeParse(body);
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

    const { sessionId, answers } = validationResult.data;

    // Fetch trial session from database
    let session;
    try {
      session = await prisma.trialSession.findUnique({
        where: { id: sessionId },
      });
    } catch (error) {
      console.error("[Trial Submit] Database error:", error);
      return createErrorResponse(
        "Failed to fetch session",
        "DATABASE_ERROR",
        requestId,
        500
      );
    }

    if (!session) {
      return createErrorResponse(
        "Trial session not found",
        "SESSION_NOT_FOUND",
        requestId,
        404
      );
    }

    // Group answers by domain
    const answersByDomain: Record<string, typeof answers> = {
      attention: [],
      emotional: [],
      social: [],
      behavioral: [],
      learning: [],
    };

    for (const answer of answers) {
      const question = questions.trial.find((q) => q.id === answer.questionId);
      if (!question) {
        return createErrorResponse(
          `Question not found: ${answer.questionId}`,
          "INVALID_QUESTION",
          requestId,
          400
        );
      }

      if (!answersByDomain[question.domain]) {
        answersByDomain[question.domain] = [];
      }
      answersByDomain[question.domain].push(answer);
    }

    // Calculate domain scores
    const domainScores = Object.entries(answersByDomain).map(
      ([domain, domainAnswers]) => {
        const score = calculateDomainScore(domainAnswers);
        const severity = determineSeverity(score);
        const percentile = calculatePercentile(score, 6);

        return {
          domain: domain as
            | "attention"
            | "emotional"
            | "social"
            | "behavioral"
            | "learning",
          score,
          percentile,
          severity,
        };
      }
    );

    // Generate summary based on domain scores
    const criticalDomains = domainScores
      .filter((d) => d.severity === "severe" || d.severity === "moderate")
      .map((d) => d.domain);

    let summary = "";
    if (criticalDomains.length === 0) {
      summary =
        "The assessment indicates typical development across all behavioral domains. Continue monitoring for any changes.";
    } else if (criticalDomains.length <= 2) {
      summary = `The assessment suggests possible concerns in ${criticalDomains.join(" and ")} domains. Further evaluation by a professional may be beneficial.`;
    } else {
      summary = `The assessment indicates multiple areas of concern across ${criticalDomains.join(", ")} domains. Professional evaluation is recommended.`;
    }

    // Generate recommendations
    const recommendations = domainScores
      .filter((d) => d.severity === "severe" || d.severity === "moderate")
      .map((d) => {
        const domainName =
          d.domain.charAt(0).toUpperCase() + d.domain.slice(1);
        return `Focus on supporting ${domainName.toLowerCase()} skills through targeted interventions.`;
      });

    if (recommendations.length === 0) {
      recommendations.push("Continue current support strategies.");
    }

    // Update trial session in database
    try {
      await prisma.trialSession.update({
        where: { id: sessionId },
        data: {
          status: "completed",
          answers: JSON.stringify(answers),
          completedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("[Trial Submit] Update error:", error);
      return createErrorResponse(
        "Failed to update session",
        "DATABASE_ERROR",
        requestId,
        500
      );
    }

    // Format response
    const responseBody = TrialSubmitResponseSchema.parse({
      sessionId,
      domainScores,
      summary,
      recommendations,
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
    console.error("[Trial Submit] Unexpected error:", errorMessage);

    return createErrorResponse(
      "Internal server error",
      "INTERNAL_ERROR",
      requestId,
      500
    );
  }
}
