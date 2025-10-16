import { NextRequest, NextResponse } from "next/server";
import { ConversationalSession } from "@/lib/ai/conversational/types";
import { databaseSessionStore } from "@/lib/ai/conversational/DatabaseSessionStore";
import { sessionStore } from "@/lib/ai/conversational/SessionStore";
import { ConversationalAIFactory } from "@/lib/ai/conversational/ConversationalAIFactory";
import { AssessmentDomain, RiskLevel } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    let session = await databaseSessionStore.get(sessionId);
    if (!session) {
      session = sessionStore.get(sessionId);
    }
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!session.isComplete) {
      return NextResponse.json(
        { error: "Assessment not complete" },
        { status: 400 }
      );
    }

    // Convert responses to the format expected by the scoring system
    const responses = Object.entries(session.responses).map(
      ([questionId, answer]) => ({
        questionId,
        response: answer,
      })
    );

    // Calculate scores by domain (same logic as regular trial assessment)
    const scoresByDomain: Record<string, { score: number; total: number }> = {};

    session.questions.forEach((question) => {
      const domainSlug = question.domainSlug || "unknown";
      const response = session.responses[question.id];

      if (!scoresByDomain[domainSlug]) {
        scoresByDomain[domainSlug] = { score: 0, total: 0 };
      }

      if (response !== undefined) {
        const weight = question.weight || 1;
        scoresByDomain[domainSlug].score += response ? weight : 0;
        scoresByDomain[domainSlug].total += weight;
      }
    });

    // Convert to percentage scores for summary
    const scores: Record<string, number> = {};
    Object.entries(scoresByDomain).forEach(([domain, data]) => {
      scores[domain] = data.total > 0 ? (data.score / data.total) * 100 : 0;
    });

    // Generate kid-friendly summary using CONVERSATIONAL_ANALYSIS prompt
    const aiProvider = ConversationalAIFactory.create(session.isTrial || false);
    let summary = "";

    try {
      if (aiProvider.generateSummary) {
        summary = await aiProvider.generateSummary(session, scores);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      summary =
        "Thanks for completing the assessment! Your results show areas where you're doing well and some that might need a little extra attention. 😊";
    }

    // Save scores to database (for authenticated users only, not trial)
    let savedAssessmentId: string | null = null;
    if (!session.isTrial && session.userId) {
      try {
        // MUST have an assessmentId from the start route
        if (!session.assessmentId) {
          console.error(`[Conversational] ⚠️ No assessmentId in session for user ${session.userId}`);
          return NextResponse.json(
            { error: "Invalid session - missing assessment ID" },
            { status: 400 }
          );
        }

        // Save results to EXISTING assessment (created in start route)
        savedAssessmentId = await saveConversationalAssessmentResults(
          session,
          scoresByDomain,
          responses
        );
        console.log(
          `[Conversational] ✅ Saved assessment and scores: ${savedAssessmentId}`
        );

        // ✅ CHARGE CONVERSATIONAL CREDIT ON COMPLETION (simpler logic)
        // Since assessment was just marked COMPLETED, charge the credit now
        const userLicense = await prisma.userLicense.findFirst({
          where: { userId: session.userId },
        });

        if (userLicense) {
          await prisma.userLicense.update({
            where: { id: userLicense.id },
            data: {
              conversationalAssessmentsUsed: {
                increment: 1,
              },
            },
          });
          console.log(
            `[Conversational] ✅ Charged 1 conversational credit for user ${session.userId} (assessment ${savedAssessmentId})`
          );
        }
      } catch (error) {
        console.error(
          "[Conversational] Error saving assessment results:",
          error
        );
        // Don't fail the request if saving fails
      }
    }

    // Clean up session from database
    if (session.isTrial) {
      sessionStore.delete(sessionId);
    } else {
      await databaseSessionStore.delete(sessionId);
    }

    return NextResponse.json({
      responses,
      scores,
      scoresByDomain,
      summary, // Kid-friendly markdown-formatted results
      totalQuestions: session.questions.length,
      answeredQuestions: Object.keys(session.responses).length,
    });
  } catch (error) {
    console.error("Error completing conversational assessment:", error);
    return NextResponse.json(
      { error: "Failed to complete assessment" },
      { status: 500 }
    );
  }
}

/**
 * Update Assessment record and save scores for conversational assessments
 * Returns the assessment ID
 *
 * NOTE: For full assessments, the Assessment record is already created in the start route.
 * This function ONLY updates it with completion data.
 */
async function saveConversationalAssessmentResults(
  session: any,
  scoresByDomain: Record<string, { score: number; total: number }>,
  responses: any[]
): Promise<string> {
  // For full conversational assessments, assessmentId MUST exist (created in start route)
  if (!session.assessmentId) {
    throw new Error("Assessment ID is required for full conversational assessments");
  }

  // Update existing assessment record with completion data
  await prisma.assessment.update({
    where: { id: session.assessmentId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      // Store the responses in childResponses JSON field
      childResponses: {
        responses: responses,
      },
    },
  });

  // Save the domain scores
  await saveScoresToDatabase(session.assessmentId, scoresByDomain, session.questions);

  return session.assessmentId;
}

/**
 * Save calculated scores to the database as Score records
 * This allows enhanced reports and regular reports to display domain scores
 */
async function saveScoresToDatabase(
  assessmentId: string,
  scoresByDomain: Record<string, { score: number; total: number }>,
  questions: any[]
) {
  // Map risk levels based on percentage scores
  const mapScoreToRiskLevel = (percentage: number): RiskLevel => {
    if (percentage >= 75) return "VERY_HIGH";
    if (percentage >= 50) return "HIGH";
    if (percentage >= 25) return "MODERATE";
    return "LOW";
  };

  // Find domain templates for each domain slug
  const domainSlugs = Object.keys(scoresByDomain);
  const domainTemplates = await prisma.domainTemplate.findMany({
    where: {
      slug: { in: domainSlugs },
    },
  });

  const domainTemplateMap = new Map(domainTemplates.map((dt) => [dt.slug, dt]));

  // Prepare score records
  const baseTimestamp = new Date();
  const scoreRecords = Object.entries(scoresByDomain).map(
    ([domainSlug, data], index) => {
      const domainTemplate = domainTemplateMap.get(domainSlug);
      const percentage = data.total > 0 ? (data.score / data.total) * 100 : 0;
      const riskLevel = mapScoreToRiskLevel(percentage);

      // Count questions answered for this domain
      const domainQuestions = questions.filter(
        (q) => q.domainSlug === domainSlug
      );
      const questionsAnswered = domainQuestions.length;

      return {
        assessmentId,
        domainTemplateId: domainTemplate?.id || null,
        domainName: domainTemplate?.name || domainSlug,
        domain: null, // Don't use legacy enum for conversational assessments
        rawScore: data.score,
        totalPossible: data.total,
        questionsAnswered,
        riskLevel,
        confidence: percentage >= 50 ? 0.9 : 0.7, // Higher confidence for significant scores
        wasTerminatedEarly: false,
        timestamp: new Date(baseTimestamp.getTime() + index), // Unique timestamps
      };
    }
  );

  // Delete existing scores for this assessment (in case of re-completion)
  await prisma.score.deleteMany({
    where: { assessmentId },
  });

  // Create new score records
  await prisma.score.createMany({
    data: scoreRecords,
  });
}
