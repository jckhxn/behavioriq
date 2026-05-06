import { NextRequest, NextResponse } from "next/server";
import { RiskLevel } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

interface AnswerPayload {
  qid: string;
  value: number | string | boolean;
}

const normalizeNumeric = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const parsed = Number(v);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const DEFAULT_RISK_THRESHOLDS = {
  VERY_HIGH: 75,
  HIGH: 50,
  MODERATE: 25,
} as const;

const defaultRiskLevel = (percentage: number): RiskLevel => {
  if (percentage >= DEFAULT_RISK_THRESHOLDS.VERY_HIGH) return "VERY_HIGH";
  if (percentage >= DEFAULT_RISK_THRESHOLDS.HIGH) return "HIGH";
  if (percentage >= DEFAULT_RISK_THRESHOLDS.MODERATE) return "MODERATE";
  return "LOW";
};

const determineRiskLevel = (
  rawScore: number,
  percentage: number,
  scoringConfig?: any
): RiskLevel => {
  const parseValue = (value: unknown): number | null => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  if (scoringConfig && typeof scoringConfig === "object") {
    const thresholdsSource =
      scoringConfig.riskThresholds || scoringConfig.thresholds || undefined;

    if (thresholdsSource && typeof thresholdsSource === "object") {
      const thresholds = Object.entries(thresholdsSource).reduce<Record<string, number>>(
        (acc, [key, value]) => {
          const numeric = parseValue(value);
          if (numeric !== null) {
            acc[key.toLowerCase()] = numeric;
          }
          return acc;
        },
        {}
      );

      if (
        thresholds["very_high"] !== undefined &&
        rawScore >= thresholds["very_high"]
      ) {
        return "VERY_HIGH";
      }
      if (
        thresholds["veryhigh"] !== undefined &&
        rawScore >= thresholds["veryhigh"]
      ) {
        return "VERY_HIGH";
      }
      if (thresholds["severe"] !== undefined && rawScore >= thresholds["severe"]) {
        return "VERY_HIGH";
      }
      if (thresholds["high"] !== undefined && rawScore >= thresholds["high"]) {
        return "HIGH";
      }
      if (
        thresholds["elevated"] !== undefined &&
        rawScore >= thresholds["elevated"]
      ) {
        return "HIGH";
      }
      if (
        thresholds["moderate"] !== undefined &&
        rawScore >= thresholds["moderate"]
      ) {
        return "MODERATE";
      }
      if (thresholds["watch"] !== undefined && rawScore >= thresholds["watch"]) {
        return "MODERATE";
      }
    }
  }

  return defaultRiskLevel(percentage);
};

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
                domainTemplate: {
                  select: {
                    id: true,
                    name: true,
                    questions: true, // Make sure questions are loaded
                    scoringConfig: true,
                  },
                },
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

    // Convert value to persisted response and score (supports Likert and custom option values)
    const stringValue = String(value);
    let scoreValue = 0;

    const allTemplateQuestions = assessment.assessmentTemplate.domains.flatMap(
      (d: any) => (Array.isArray(d?.domainTemplate?.questions) ? d.domainTemplate.questions : [])
    );
    const currentQuestion = allTemplateQuestions.find((q: any) => q?.id === qid);

    const directNumeric = normalizeNumeric(value);
    if (directNumeric !== null) {
      scoreValue = directNumeric;
    } else if (typeof value === "boolean") {
      scoreValue = value ? 1 : 0;
    } else if (typeof value === "string") {
      const lower = value.toLowerCase();
      const byYesNo =
        lower === "y" || lower === "yes" || lower === "true" ? 1 :
        lower === "n" || lower === "no" || lower === "false" ? 0 :
        null;

      if (byYesNo !== null) {
        scoreValue = byYesNo;
      } else if (Array.isArray(currentQuestion?.options)) {
        const matchedOption = currentQuestion.options.find((opt: any) =>
          String(opt?.label ?? "").toLowerCase() === lower ||
          String(opt?.value ?? "") === value
        );
        const optionNumeric = normalizeNumeric(matchedOption?.value);
        scoreValue = optionNumeric ?? 0;
      }
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
        response: stringValue,
        score: scoreValue,
      },
      create: {
        assessmentId,
        questionId: qid,
        response: stringValue,
        score: scoreValue,
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
    // Always calculate/recalculate scores when done, regardless of status
    // This ensures trial→full transition creates full scores
    if (isDone) {
      try {
        console.log(
          `[answer] Creating/updating scores for assessment ${assessmentId}, domains count: ${assessment.assessmentTemplate.domains?.length || 0}`
        );

        // Delete existing scores to recalculate (ensures accuracy on trial→full transition)
        await prisma.score.deleteMany({
          where: { assessmentId },
        });

        // Calculate scores for each domain
        const scores = [];
        for (const domain of assessment.assessmentTemplate.domains) {
        const domainTemplate = domain.domainTemplate as any;

        // Skip if no domainTemplate or no questions
        if (!domainTemplate || !domainTemplate.questions) {
          console.warn(
            `[answer] Skipping domain without template or questions: ${domain.id}`
          );
          continue;
        }

        const questions = domainTemplate.questions as any[];

        // Get active questions for this domain
        let domainQuestions = questions.filter((q: any) => q.active !== false);
        if (assessment.mode === "TRIAL") {
          domainQuestions = domainQuestions.filter((q: any) => q.isTrial);
        }

        // Sum numeric response scores for this domain
        const responseMap = new Map(
          assessment.responses.map((r: any) => [r.questionId, r])
        );
        responseMap.set(qid, {
          questionId: qid,
          response: stringValue,
          score: scoreValue,
        });

        let domainScoreSum = 0;
        let answeredInDomain = 0;
        let totalPossible = 0;
        for (const question of domainQuestions) {
          const response = responseMap.get(question.id as string) as any;

          const questionMax = Array.isArray(question.options)
            ? Math.max(
                ...question.options
                  .map((opt: any) => normalizeNumeric(opt?.value))
                  .filter((v: number | null): v is number => v !== null),
                1
              )
            : 1;
          totalPossible += questionMax;

          if (response) {
            answeredInDomain++;
            domainScoreSum += Number(response.score || 0);
          }
        }

        // Only create score if there are questions in this domain
        if (domainQuestions.length > 0) {
          const rawScore = domainScoreSum;
          if (totalPossible <= 0) {
            totalPossible = domainQuestions.length;
          }

          // Calculate risk level based on percentage
          // Valid RiskLevel enum values: LOW, MODERATE, HIGH, VERY_HIGH
          const percentage = totalPossible > 0 ? (rawScore / totalPossible) * 100 : 0;
          const riskLevel = determineRiskLevel(
            rawScore,
            percentage,
            domainTemplate.scoringConfig
          );

          // Map valid AssessmentDomain enums
          const validDomains: { [key: string]: string } = {
            ANTISOCIAL: "ANTISOCIAL",
            VIOLENCE: "VIOLENCE",
            ATTENTION: "ATTENTION",
            EMOTIONAL: "EMOTIONAL",
            CONDUCT: "CONDUCT",
          };

          // Map domainTemplate.name to enum
          let domainEnum = null;
          if (domainTemplate.name) {
            // Map domainTemplate.name to enum
            const nameLower = domainTemplate.name.toLowerCase();
            if (nameLower.includes("emotional")) domainEnum = "EMOTIONAL";
            else if (nameLower.includes("hyperactivity") || nameLower.includes("impulsivity") || nameLower.includes("attention"))
              domainEnum = "ATTENTION";
            else if (nameLower.includes("conduct")) domainEnum = "CONDUCT";
            else if (nameLower.includes("violence") || nameLower.includes("aggressive"))
              domainEnum = "VIOLENCE";
            else if (nameLower.includes("antisocial")) domainEnum = "ANTISOCIAL";
            else domainEnum = "EMOTIONAL"; // Safe default
          } else {
            domainEnum = "EMOTIONAL"; // Safe default
          }

          scores.push({
            assessmentId,
            domain: domainEnum as any,
            domainTemplateId: domainTemplate.id || null,
            domainName: domainTemplate.name || "Unknown Domain",
            rawScore,
            totalPossible,
            riskLevel,
            confidence: 0.95, // Default confidence
            questionsAnswered: answeredInDomain,
            wasTerminatedEarly: false,
          });
        }
      }

        // Create all scores for this assessment
        console.log(`[answer] Scores to create: ${scores.length}`);
        if (scores.length > 0) {
          console.log("[answer] Creating scores:", JSON.stringify(scores, null, 2));
          await prisma.score.createMany({
            data: scores,
            skipDuplicates: true,
          });
          console.log(`[answer] Successfully created ${scores.length} scores`);
        } else {
          console.log("[answer] No scores to create - domains may not have questions");
        }

        await prisma.assessment.update({
          where: { id: assessmentId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      } catch (scoreError) {
        console.error(
          "[answer] Error creating scores, still marking assessment complete:",
          scoreError
        );
        // Still mark assessment as complete even if score creation fails
        await prisma.assessment.update({
          where: { id: assessmentId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      }
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
