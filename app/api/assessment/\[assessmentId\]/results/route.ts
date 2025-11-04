import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  AssessmentResultsResponseSchema,
} from "@/lib/api/chatgpt/schemas";
import { createErrorResponse } from "@/lib/api/chatgpt/middleware";
import { v4 as uuidv4 } from "uuid";

/**
 * Determine severity level based on percentile
 */
function determineSeverity(
  percentile: number
): "normal" | "mild" | "moderate" | "severe" {
  if (percentile <= 15) return "normal";
  if (percentile <= 40) return "mild";
  if (percentile <= 70) return "moderate";
  return "severe";
}

/**
 * GET /api/assessment/[assessmentId]/results
 * Get assessment results (no auth required, but rate-limited)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const requestId = uuidv4();

  try {
    const { assessmentId } = await params;

    if (!assessmentId) {
      return createErrorResponse(
        "Assessment ID is required",
        "MISSING_PARAMETER",
        requestId,
        400
      );
    }

    // Fetch assessment from database
    let assessment;
    try {
      assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
          scores: true,
        },
      });
    } catch (error) {
      console.error("[Assessment Results] Database error:", error);
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

    // Verify assessment is completed
    if (assessment.status !== "COMPLETED") {
      return createErrorResponse(
        `Assessment is not yet completed (status: ${assessment.status.toLowerCase()})`,
        "ASSESSMENT_NOT_COMPLETED",
        requestId,
        400
      );
    }

    // Fetch all responses for this assessment
    let responses;
    try {
      responses = await prisma.questionResponse.findMany({
        where: { assessmentId },
      });
    } catch (error) {
      console.error("[Assessment Results] Response fetch error:", error);
      return createErrorResponse(
        "Failed to fetch assessment responses",
        "DATABASE_ERROR",
        requestId,
        500
      );
    }

    // Calculate overall score
    const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
    const maxScore = responses.length * 4; // Max 4 points per question
    const overallPercentile = Math.round((totalScore / maxScore) * 100);
    const overallSeverity = determineSeverity(overallPercentile);

    // Format domain scores
    const domainScores = assessment.scores.map((score) => ({
      domain: score.domain as
        | "attention"
        | "emotional"
        | "social"
        | "behavioral"
        | "learning",
      score: score.score,
      percentile: score.percentile,
      severity: determineSeverity(score.percentile),
    }));

    // Generate recommendations based on domain scores
    const recommendations = domainScores
      .filter(
        (d) => d.severity === "moderate" || d.severity === "severe"
      )
      .map((d) => ({
        domain: d.domain,
        title: `${d.domain.charAt(0).toUpperCase() + d.domain.slice(1)} Support Recommended`,
        description: `Score in the ${d.severity} range for ${d.domain} domain. Consider targeted interventions or professional consultation.`,
        priority: d.severity === "severe" ? "high" : "medium",
      }));

    if (recommendations.length === 0) {
      recommendations.push({
        domain: "general",
        title: "Typical Development",
        description:
          "Assessment scores indicate typical development across all domains. Continue current support strategies.",
        priority: "low",
      });
    }

    // Generate next steps
    const nextSteps = [
      "Review results with child and family members",
      "Share results with relevant professionals (teachers, therapists, etc.)",
      "Consider follow-up assessment in 6-12 months to monitor progress",
    ];

    if (recommendations.some((r) => r.priority === "high")) {
      nextSteps.unshift(
        "Schedule consultation with behavioral health professional"
      );
    }

    // Format response
    const responseBody = AssessmentResultsResponseSchema.parse({
      assessmentId,
      childName: assessment.subjectName,
      childAge: assessment.childAge || 0,
      completedAt: assessment.completedAt?.toISOString() || new Date().toISOString(),
      domainScores,
      overall: {
        score: totalScore,
        percentile: overallPercentile,
        severity: overallSeverity,
      },
      recommendations,
      nextSteps,
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
    console.error("[Assessment Results] Unexpected error:", errorMessage);

    return createErrorResponse(
      "Internal server error",
      "INTERNAL_ERROR",
      requestId,
      500
    );
  }
}
