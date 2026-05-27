import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/assessment/:id/results
 *
 * Returns assessment results for an Assessment record (not AssessmentTrial)
 * Calculates domain scores from question responses
 * Used by new trial system that uses Assessment model with mode=TRIAL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessmentId = id;

    // Fetch assessment with template and responses
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
        responses: true,
        user: {
          select: { name: true, email: true },
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

    // Build map of responses (response is now a string)
    const responseMap = new Map<string, string>();
    assessment.responses.forEach((r) => {
      responseMap.set(r.questionId, r.response);
    });

    // Calculate domain scores
    const domainScores: Array<{
      name: string;
      score: number;
      answered: number;
      total: number;
    }> = [];

    assessment.assessmentTemplate.domains.forEach((domain) => {
      const domainTemplate = domain.domainTemplate;
      const questions = Array.isArray(domainTemplate.questions)
        ? domainTemplate.questions
        : [];

      // Filter to only trial questions if in TRIAL mode
      let relevantQuestions = questions;
      if (assessment.mode === "TRIAL") {
        relevantQuestions = questions.filter(
          (q: any) => q.isTrial === true
        );
      }

      // Score: normalize each question to 0–1 (Likert) or 0/1 (boolean)
      let domainScore = 0;
      let answeredCount = 0;

      relevantQuestions.forEach((q: any) => {
        const response = responseMap.get(q.id);
        if (response === undefined) return;
        answeredCount++;
        const isLikert = q.responseType === "likert" || q.likertScale;
        if (isLikert && q.likertScale) {
          const val = Number(response);
          const range = q.likertScale.max - q.likertScale.min;
          if (!isNaN(val) && range > 0) {
            domainScore += (val - q.likertScale.min) / range;
          }
        } else {
          const responseStr = String(response).toLowerCase();
          const isYes =
            responseStr === "true" ||
            responseStr === "yes" ||
            responseStr === "1" ||
            responseStr === "y";
          if (isYes) domainScore += 1;
        }
      });

      // Calculate score as percentage
      const score =
        relevantQuestions.length > 0
          ? Math.round((domainScore / relevantQuestions.length) * 100)
          : 0;

      domainScores.push({
        name: domainTemplate.name,
        score,
        answered: answeredCount,
        total: relevantQuestions.length,
      });
    });

    // Get elevated domains (score >= 70)
    const flags = domainScores
      .filter((d) => d.score >= 70)
      .map((d) => d.name);

    // Determine if assessment is complete
    const totalQuestions = assessment.assessmentTemplate.domains.reduce(
      (sum, domain) => {
        const questions = Array.isArray(domain.domainTemplate.questions)
          ? domain.domainTemplate.questions
          : [];
        const relevantQuestions =
          assessment.mode === "TRIAL"
            ? questions.filter((q: any) => q.isTrial === true)
            : questions;
        return sum + relevantQuestions.length;
      },
      0
    );

    const isComplete = assessment.responses.length >= totalQuestions;

    const response = {
      id: assessmentId,
      mode: assessment.mode,
      completedAt: assessment.completedAt || new Date().toISOString(),
      childLabel: assessment.subjectName || "Child",
      anonymous: !assessment.userId,
      domains: domainScores,
      flags,
      isComplete,
      answeredCount: assessment.responses.length,
      totalCount: totalQuestions,
      // sessionId is required for checkout/lead submission
      // Must be set when assessment is created to link to SnapshotSession
      sessionId: assessment.sessionId || assessmentId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[assessment/[id]/results] failed", error);
    return NextResponse.json(
      { error: "Unable to load assessment results" },
      { status: 500 }
    );
  }
}
