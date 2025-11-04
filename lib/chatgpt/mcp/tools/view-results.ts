import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

interface ViewResultsInput {
  resultId: string;
}

/**
 * view_results tool
 * Retrieves assessment results and displays them with scores, percentiles, and recommendations
 */
export async function viewResults(input: ViewResultsInput) {
  try {
    const { resultId } = input;

    if (!resultId || typeof resultId !== "string") {
      return {
        content: [
          {
            type: "text",
            text: "Invalid result ID provided.",
          },
        ],
        isError: true,
      };
    }

    // Get current user
    const user = await getCurrentUserWithRole();

    // Fetch assessment result
    const result = await prisma.assessmentResult.findUnique({
      where: { id: resultId },
      include: {
        assessment: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!result) {
      return {
        content: [
          {
            type: "text",
            text: "Assessment result not found.",
          },
        ],
        isError: true,
      };
    }

    // Check authorization - user must own the assessment or be admin
    if (user && user.id !== result.assessment.userId && user.role !== "SUPER_ADMIN") {
      return {
        content: [
          {
            type: "text",
            text: "You do not have permission to view this assessment result.",
          },
        ],
        isError: true,
      };
    }

    // Format results for display
    const formattedScores = formatScores(result.scores as any);
    const recommendations = generateRecommendations(
      result.scores as any,
      result.assessment.childAge
    );

    return {
      content: [
        {
          type: "text",
          text: `Assessment Results for ${result.assessment.childName} (Age ${result.assessment.childAge}) - ${result.createdAt.toLocaleDateString()}`,
        },
      ],
      structuredContent: {
        assessmentId: result.assessment.id,
        resultId: result.id,
        childName: result.assessment.childName,
        childAge: result.assessment.childAge,
        relationshipType: result.assessment.relationshipType,
        completedAt: result.createdAt.toISOString(),
        overallScore: result.overallScore,
        percentile: result.percentile,
        categoryScores: formattedScores,
        recommendations: recommendations,
        riskLevel: getRiskLevel(result.overallScore),
        nextSteps: generateNextSteps(result.overallScore),
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/results.html",
        "openai/widgetAccessible": true,
        "openai/widgetState": {
          resultId: result.id,
          scores: formattedScores,
          percentile: result.percentile,
          riskLevel: getRiskLevel(result.overallScore),
        },
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error retrieving assessment results: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Format raw scores into human-readable format with percentiles
 */
function formatScores(scores: Record<string, number>) {
  const categoryLabels: Record<string, string> = {
    attention: "Attention & Focus",
    behavior: "Behavior & Impulse Control",
    social: "Social & Peer Relations",
    emotion: "Emotional & Mood",
    academic: "Academic & Learning",
  };

  const formatted: Record<string, any> = {};

  for (const [category, score] of Object.entries(scores)) {
    if (categoryLabels[category]) {
      const percentile = scoreToPercentile(score);
      const severity = scoreSeverity(percentile);

      formatted[category] = {
        label: categoryLabels[category],
        rawScore: Math.round(score),
        percentile,
        severity,
        interpretation: getSeverityInterpretation(severity),
      };
    }
  }

  return formatted;
}

/**
 * Convert raw score to percentile (0-100)
 */
function scoreToPercentile(score: number): number {
  // Simplified conversion - in production, use standardized norms
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Determine severity level from percentile
 */
function scoreSeverity(percentile: number): string {
  if (percentile >= 90) return "severe";
  if (percentile >= 75) return "significant";
  if (percentile >= 50) return "moderate";
  if (percentile >= 25) return "mild";
  return "minimal";
}

/**
 * Get interpretation text for severity level
 */
function getSeverityInterpretation(severity: string): string {
  const interpretations: Record<string, string> = {
    minimal: "Few concerns in this area",
    mild: "Minor concerns noted",
    moderate: "Moderate concerns present",
    significant: "Significant concerns present",
    severe: "Severe concerns present",
  };
  return interpretations[severity] || "Unable to determine";
}

/**
 * Determine overall risk level from overall score
 */
function getRiskLevel(score: number): string {
  const percentile = scoreToPercentile(score);
  if (percentile >= 90) return "high";
  if (percentile >= 70) return "elevated";
  if (percentile >= 50) return "moderate";
  return "low";
}

/**
 * Generate category-specific recommendations based on scores
 */
function generateRecommendations(scores: Record<string, number>, childAge: number) {
  const recommendations: string[] = [];

  // Attention recommendations
  if (scores.attention && scoreToPercentile(scores.attention) > 75) {
    recommendations.push(
      `${childAge >= 6 ? "Consider evaluation for ADHD. Implement structured routines and break tasks into smaller steps." : "Provide more frequent breaks and shorter activity periods."}`
    );
  }

  // Behavior recommendations
  if (scores.behavior && scoreToPercentile(scores.behavior) > 75) {
    recommendations.push(
      "Implement consistent behavioral expectations and positive reinforcement strategies. Consider behavior support plans."
    );
  }

  // Social recommendations
  if (scores.social && scoreToPercentile(scores.social) > 75) {
    recommendations.push(
      `${childAge >= 6 ? "Social skills coaching and structured peer interactions recommended. Consider evaluation for autism spectrum." : "Increase supervised play opportunities with peers."}`
    );
  }

  // Emotional recommendations
  if (scores.emotion && scoreToPercentile(scores.emotion) > 75) {
    recommendations.push(
      "Consult with mental health professional. Teach emotional regulation and coping strategies. Monitor for anxiety or depression."
    );
  }

  // Academic recommendations
  if (scores.academic && scoreToPercentile(scores.academic) > 75) {
    recommendations.push(
      "Request academic evaluation and consider tutoring or educational support plan (IEP/504)."
    );
  }

  // Add general recommendation if no specific concerns
  if (recommendations.length === 0) {
    recommendations.push(
      "Child is showing typical development. Continue with current support and monitoring."
    );
  }

  return recommendations;
}

/**
 * Generate next steps based on overall risk level
 */
function generateNextSteps(score: number): string[] {
  const riskLevel = getRiskLevel(score);
  const percentile = scoreToPercentile(score);

  const steps: string[] = [];

  if (riskLevel === "high") {
    steps.push(
      "Schedule appointment with pediatrician to discuss results",
      "Request professional evaluation (psychologist, developmental pediatrician)",
      "Review results with school or childcare provider",
      "Explore intervention and support options"
    );
  } else if (riskLevel === "elevated") {
    steps.push(
      "Monitor behaviors closely over next few weeks",
      "Discuss results with healthcare provider if concerns persist",
      "Implement suggested strategies at home and school",
      "Schedule follow-up assessment in 3-6 months"
    );
  } else if (riskLevel === "moderate") {
    steps.push(
      "Continue current support and monitoring",
      "Implement any recommended strategies",
      "Share results with school if appropriate",
      "Schedule routine check-up with pediatrician"
    );
  } else {
    steps.push(
      "Child is developing typically",
      "Continue current parenting/educational approaches",
      "Schedule routine pediatric visits as recommended",
      "Maintain open communication with school"
    );
  }

  return steps;
}
