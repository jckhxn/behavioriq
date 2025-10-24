import { NextRequest, NextResponse } from "next/server";
import { ConversationalSession } from "@/lib/ai/conversational/types";
import { databaseSessionStore } from "@/lib/ai/conversational/DatabaseSessionStore";
import { sessionStore } from "@/lib/ai/conversational/SessionStore";
import { ConversationalAIFactory } from "@/lib/ai/conversational/ConversationalAIFactory";
import { RiskLevel } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type DomainAggregation = {
  slug: string;
  domainName: string;
  domainTemplateId: string | null;
  yesWeight: number;
  answeredWeight: number;
  totalWeight: number;
  questionsAnswered: number;
  totalQuestions: number;
};

type DomainScoreRecord = {
  slug: string;
  domainName: string;
  domainTemplateId: string | null;
  rawScore: number;
  answeredWeight: number;
  totalWeight: number;
  questionsAnswered: number;
  totalQuestions: number;
  percentage: number;
  riskLevel: RiskLevel;
};

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

    // Convert responses to the format expected by downstream systems
    const responses = Object.entries(session.responses).map(
      ([questionId, answer]) => ({
        questionId,
        response: answer,
      })
    );

    // Aggregate scoring data per domain
    const domainAggregations = new Map<string, DomainAggregation>();

    session.questions.forEach((question) => {
      const domainSlug = question.domainSlug || "unknown";

      if (!domainAggregations.has(domainSlug)) {
        domainAggregations.set(domainSlug, {
          slug: domainSlug,
          domainName: question.domain || domainSlug,
          domainTemplateId: (question as any).domainTemplateId || null,
          yesWeight: 0,
          answeredWeight: 0,
          totalWeight: 0,
          questionsAnswered: 0,
          totalQuestions: 0,
        });
      }

      const aggregate = domainAggregations.get(domainSlug)!;
      const weight = normalizeWeight(question.weight);
      const response = session.responses[question.id];

      aggregate.totalWeight += weight;
      aggregate.totalQuestions += 1;

      if (response !== undefined) {
        aggregate.answeredWeight += weight;
        aggregate.questionsAnswered += 1;
        if (response) {
          aggregate.yesWeight += weight;
        }
      }

      if (!aggregate.domainName && question.domain) {
        aggregate.domainName = question.domain;
      }

      if (!aggregate.domainTemplateId && (question as any).domainTemplateId) {
        aggregate.domainTemplateId = (question as any).domainTemplateId;
      }
    });

    // Resolve domain templates for richer metadata and scoring config
    const domainSlugs = Array.from(domainAggregations.keys()).filter(
      (slug) => slug !== "unknown"
    );
    const domainTemplates = domainSlugs.length
      ? await prisma.domainTemplate.findMany({
          where: { slug: { in: domainSlugs } },
          select: {
            id: true,
            slug: true,
            name: true,
            scoringConfig: true,
          },
        })
      : [];
    const domainTemplateMap = new Map(
      domainTemplates.map((template) => [template.slug, template])
    );

    domainAggregations.forEach((aggregate) => {
      const template = domainTemplateMap.get(aggregate.slug);
      if (template) {
        aggregate.domainName = template.name || aggregate.domainName;
        aggregate.domainTemplateId = template.id;
      }
    });

    const slugPercentages: Record<string, number> = {};
    const aiScores: Record<string, number> = {};
    const domainScoreRecords: Record<string, DomainScoreRecord> = {};

    domainAggregations.forEach((aggregate) => {
      const template = domainTemplateMap.get(aggregate.slug);
      const rawScore = roundTo(aggregate.yesWeight, 4);
      const denominator =
        aggregate.answeredWeight > 0
          ? aggregate.answeredWeight
          : aggregate.totalWeight;
      const percentage =
        denominator > 0 ? (rawScore / denominator) * 100 : 0;
      const normalizedPercentage = roundTo(percentage, 2);
      const domainName =
        aggregate.domainName || template?.name || aggregate.slug;

      const riskLevel = determineRiskLevel(
        rawScore,
        normalizedPercentage,
        template
      );

      const record: DomainScoreRecord = {
        slug: aggregate.slug,
        domainName,
        domainTemplateId: template?.id ?? aggregate.domainTemplateId ?? null,
        rawScore,
        answeredWeight: roundTo(aggregate.answeredWeight, 4),
        totalWeight: roundTo(aggregate.totalWeight, 4),
        questionsAnswered: aggregate.questionsAnswered,
        totalQuestions: aggregate.totalQuestions,
        percentage: normalizedPercentage,
        riskLevel,
      };

      domainScoreRecords[aggregate.slug] = record;
      slugPercentages[aggregate.slug] = normalizedPercentage;
      aiScores[domainName] = normalizedPercentage;
    });

    const scores = slugPercentages;
    const scoresByDomainResponse = buildScoresByDomainResponse(
      domainScoreRecords
    );

    // Generate kid-friendly summary using CONVERSATIONAL_ANALYSIS prompt
    const aiProvider = ConversationalAIFactory.create(session.isTrial || false);
    let summary = "";

    try {
      if (aiProvider.generateSummary) {
        const summaryScores =
          Object.keys(aiScores).length > 0 ? aiScores : scores;
        summary = await aiProvider.generateSummary(session, summaryScores);
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
          domainScoreRecords,
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
              conversationalReportsUsed: {
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
      scoresByDomain: scoresByDomainResponse,
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
  session: ConversationalSession,
  domainScores: Record<string, DomainScoreRecord>,
  responses: Array<{ questionId: string; response: boolean }>
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
  await saveScoresToDatabase(session.assessmentId, domainScores);

  return session.assessmentId;
}

/**
 * Save calculated scores to the database as Score records
 * This allows enhanced reports and regular reports to display domain scores
 */
async function saveScoresToDatabase(
  assessmentId: string,
  domainScores: Record<string, DomainScoreRecord>
) {
  const domainScoreValues = Object.values(domainScores);
  const baseTimestamp = new Date();
  const scoreRecords = domainScoreValues.map((domainScore, index) => {
    const totalPossible = Math.max(
      1,
      Math.round(
        domainScore.answeredWeight > 0
          ? domainScore.answeredWeight
          : domainScore.totalWeight || domainScore.totalQuestions || 1
      )
    );

    return {
      assessmentId,
      domainTemplateId: domainScore.domainTemplateId,
      domainName: domainScore.domainName,
      domain: null,
      rawScore: roundTo(domainScore.rawScore, 4),
      totalPossible,
      questionsAnswered: domainScore.questionsAnswered,
      riskLevel: domainScore.riskLevel,
      confidence: computeConfidence(domainScore),
      wasTerminatedEarly:
        domainScore.questionsAnswered < domainScore.totalQuestions,
      timestamp: new Date(baseTimestamp.getTime() + index),
    };
  });

  // Delete existing scores for this assessment (in case of re-completion)
  await prisma.score.deleteMany({
    where: { assessmentId },
  });

  // Create new score records
  if (scoreRecords.length > 0) {
    await prisma.score.createMany({
      data: scoreRecords,
    });
  }
}

const DEFAULT_RISK_THRESHOLDS = {
  VERY_HIGH: 75,
  HIGH: 50,
  MODERATE: 25,
} as const;

function normalizeWeight(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
}

function roundTo(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function defaultRiskLevel(percentage: number): RiskLevel {
  if (percentage >= DEFAULT_RISK_THRESHOLDS.VERY_HIGH) {
    return "VERY_HIGH";
  }
  if (percentage >= DEFAULT_RISK_THRESHOLDS.HIGH) {
    return "HIGH";
  }
  if (percentage >= DEFAULT_RISK_THRESHOLDS.MODERATE) {
    return "MODERATE";
  }
  return "LOW";
}

function determineRiskLevel(
  rawScore: number,
  percentage: number,
  template?: { scoringConfig?: any }
): RiskLevel {
  const config = template?.scoringConfig as any;
  const parseValue = (value: unknown): number | null => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  if (config && typeof config === "object") {
    const thresholdsSource =
      config.riskThresholds || config.thresholds || undefined;
    if (thresholdsSource && typeof thresholdsSource === "object") {
      const thresholds = Object.entries(thresholdsSource).reduce<
        Record<string, number>
      >((acc, [key, value]) => {
        const numeric = parseValue(value);
        if (numeric !== null) {
          acc[key.toLowerCase()] = numeric;
        }
        return acc;
      }, {});

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
      if (
        thresholds["watch"] !== undefined &&
        rawScore >= thresholds["watch"]
      ) {
        return "MODERATE";
      }
    }

    if (Array.isArray(config.riskLevels)) {
      const sortedLevels = (config.riskLevels as any[])
        .map((item) => ({
          level:
            typeof item.level === "string" ? item.level.toUpperCase() : "",
          minPercentage: parseValue(item.minPercentage ?? item.threshold),
          minScore: parseValue(item.minScore),
        }))
        .filter(
          (item) =>
            item.level &&
            (item.minPercentage !== null || item.minScore !== null)
        )
        .sort((a, b) => {
          const aValue =
            (a.minPercentage ?? a.minScore ?? 0) as number;
          const bValue =
            (b.minPercentage ?? b.minScore ?? 0) as number;
          return bValue - aValue;
        });

      for (const item of sortedLevels) {
        const meetsPercentage =
          item.minPercentage !== null &&
          percentage >= (item.minPercentage as number);
        const meetsScore =
          item.minScore !== null &&
          rawScore >= (item.minScore as number);
        if (meetsPercentage || meetsScore) {
          if (item.level === "VERY_HIGH") return "VERY_HIGH";
          if (item.level === "HIGH") return "HIGH";
          if (item.level === "MODERATE") return "MODERATE";
          if (item.level === "LOW") return "LOW";
        }
      }
    }

    if (
      typeof config.significantScore === "number" &&
      Number.isFinite(config.significantScore)
    ) {
      const significantScore = Number(config.significantScore);
      if (rawScore >= significantScore) {
        return "HIGH";
      }
      const moderateThreshold =
        typeof config.moderateScore === "number" &&
        Number.isFinite(config.moderateScore)
          ? Number(config.moderateScore)
          : Math.max(Math.ceil(significantScore * 0.6), 1);
      if (rawScore >= moderateThreshold) {
        return "MODERATE";
      }
    }

    if (
      typeof config.maxScore === "number" &&
      Number.isFinite(config.maxScore) &&
      config.maxScore > 0
    ) {
      const ratio = (rawScore / config.maxScore) * 100;
      return defaultRiskLevel(ratio);
    }
  }

  return defaultRiskLevel(percentage);
}

function computeConfidence(domainScore: DomainScoreRecord): number {
  if (domainScore.questionsAnswered === 0) {
    return 0.6;
  }

  const coverage =
    domainScore.totalQuestions > 0
      ? domainScore.questionsAnswered / domainScore.totalQuestions
      : 1;

  let base = 0.7;
  if (domainScore.percentage >= DEFAULT_RISK_THRESHOLDS.VERY_HIGH) {
    base = 0.9;
  } else if (domainScore.percentage >= DEFAULT_RISK_THRESHOLDS.HIGH) {
    base = 0.85;
  } else if (domainScore.percentage >= DEFAULT_RISK_THRESHOLDS.MODERATE) {
    base = 0.8;
  }

  const confidence = base + coverage * 0.05;
  return roundTo(Math.min(0.95, Math.max(0.6, confidence)), 2);
}

function buildScoresByDomainResponse(
  domainScores: Record<string, DomainScoreRecord>
) {
  return Object.fromEntries(
    Object.entries(domainScores).map(([slug, record]) => [
      slug,
      {
        score: record.rawScore,
        total: record.answeredWeight,
        totalPossible: record.totalWeight,
        questionsAnswered: record.questionsAnswered,
        totalQuestions: record.totalQuestions,
        percentage: record.percentage,
        riskLevel: record.riskLevel,
        domainName: record.domainName,
        domainTemplateId: record.domainTemplateId,
      },
    ])
  );
}
