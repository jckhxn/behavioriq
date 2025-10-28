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
                domainTemplate: {
                  select: {
                    id: true,
                    name: true,
                    questions: true, // Make sure questions are loaded
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

        // Count yes responses for this domain
        let yesCount = 0;
        let answeredInDomain = 0;
        for (const question of domainQuestions) {
          const response = assessment.responses.find(
            (r) => r.questionId === question.id
          );
          if (response) {
            answeredInDomain++;
            if (response.response === true) {
              yesCount++;
            }
          }
        }

        // Only create score if there are questions in this domain
        if (domainQuestions.length > 0) {
          const rawScore = yesCount;
          const totalPossible = domainQuestions.length;

          // Calculate risk level based on percentage
          // Valid RiskLevel enum values: LOW, MODERATE, HIGH, VERY_HIGH
          const percentage = (yesCount / totalPossible) * 100;
          let riskLevel = "LOW";
          if (percentage >= 75) {
            riskLevel = "VERY_HIGH";
          } else if (percentage >= 50) {
            riskLevel = "HIGH";
          } else if (percentage >= 25) {
            riskLevel = "MODERATE";
          }

          // Map valid AssessmentDomain enums
          const validDomains: { [key: string]: string } = {
            ANTISOCIAL: "ANTISOCIAL",
            VIOLENCE: "VIOLENCE",
            ATTENTION: "ATTENTION",
            EMOTIONAL: "EMOTIONAL",
            CONDUCT: "CONDUCT",
          };

          // Use domain.domain if valid, otherwise map domainName to enum
          let domainEnum = null;
          if (domain.domain && validDomains[domain.domain]) {
            domainEnum = domain.domain;
          } else if (domainTemplate.name) {
            // Try to map domainTemplate.name to enum
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
            domain: domainEnum,
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
