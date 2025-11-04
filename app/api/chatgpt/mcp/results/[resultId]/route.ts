import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/chatgpt/mcp/results/[resultId]
 * Fetch assessment results for the Results widget
 * Called by Results.tsx component to display assessment scores and recommendations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  const resultId = params.resultId;

  if (!resultId) {
    return NextResponse.json(
      { error: "Result ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch the assessment result from database
    const result = await prisma.assessmentResult.findUnique({
      where: { id: resultId },
      include: {
        assessment: {
          include: {
            scores: true,
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    // Format response for widget display
    const response = {
      resultId: result.id,
      assessmentId: result.assessmentId,
      childName: result.assessment.childName || "Your Child",
      childAge: result.assessment.childAge,
      completedAt: result.createdAt.toISOString(),

      // Domain scores
      domainScores: result.assessment.scores.map((score: any) => ({
        domain: score.domain.toLowerCase(),
        score: score.score || 0,
        percentile: score.percentile || 0,
        severity: getSeverity(score.score || 0),
      })),

      // Overall score calculation
      overall: {
        score: result.assessment.scores.reduce((sum: number, s: any) => sum + (s.score || 0), 0),
        percentile: calculateOverallPercentile(result.assessment.scores),
        severity: calculateOverallSeverity(result.assessment.scores),
      },

      // Recommendations based on scores
      recommendations: generateRecommendations(result.assessment.scores),

      // Next steps
      nextSteps: [
        "Review detailed insights for each domain",
        "Share results with your child's teacher or healthcare provider",
        "Consider follow-up assessments to track progress",
        "Implement recommended strategies and interventions",
      ],
    };

    return NextResponse.json(response, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

/**
 * Determine severity level based on score
 */
function getSeverity(score: number): "normal" | "mild" | "moderate" | "severe" {
  if (score <= 3) return "normal";
  if (score <= 7) return "mild";
  if (score <= 11) return "moderate";
  return "severe";
}

/**
 * Calculate overall percentile from domain scores
 */
function calculateOverallPercentile(scores: any[]): number {
  if (!scores || scores.length === 0) return 0;
  const avgPercentile = scores.reduce((sum: number, s: any) => sum + (s.percentile || 0), 0) / scores.length;
  return Math.round(avgPercentile);
}

/**
 * Calculate overall severity from domain scores
 */
function calculateOverallSeverity(scores: any[]): "normal" | "mild" | "moderate" | "severe" {
  if (!scores || scores.length === 0) return "normal";

  const severities = scores.map((s: any) => getSeverity(s.score || 0));
  const severityOrder = { normal: 0, mild: 1, moderate: 2, severe: 3 };
  const maxSeverityLevel = Math.max(
    ...severities.map((s: string) => severityOrder[s as keyof typeof severityOrder])
  );

  const severityMap: { [key: number]: "normal" | "mild" | "moderate" | "severe" } = {
    0: "normal",
    1: "mild",
    2: "moderate",
    3: "severe",
  };

  return severityMap[maxSeverityLevel] || "normal";
}

/**
 * Generate recommendations based on domain scores
 */
function generateRecommendations(scores: any[]): Array<{
  domain: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}> {
  const recommendations: Array<{
    domain: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }> = [];

  if (!scores) return recommendations;

  scores.forEach((score: any) => {
    const domain = score.domain.toLowerCase();
    const severity = getSeverity(score.score || 0);

    const domainRecommendations: {
      [key: string]: {
        [key: string]: { title: string; description: string };
      };
    } = {
      attention: {
        severe: {
          title: "Professional Attention Assessment",
          description: "Consider a comprehensive evaluation by a pediatric psychologist or developmental specialist to assess for ADHD or attention-related disorders.",
        },
        moderate: {
          title: "Structured Support for Attention",
          description: "Implement structured daily routines, minimize distractions during tasks, and use visual cues to help maintain focus.",
        },
        mild: {
          title: "Attention-Building Activities",
          description: "Engage in activities that promote concentration, such as puzzles, reading, and interactive games.",
        },
      },
      emotional: {
        severe: {
          title: "Mental Health Professional Consultation",
          description: "Seek evaluation from a child psychologist or counselor to address emotional regulation challenges.",
        },
        moderate: {
          title: "Emotional Regulation Strategies",
          description: "Teach breathing exercises, mindfulness, and coping strategies for managing emotional responses.",
        },
        mild: {
          title: "Emotional Awareness Building",
          description: "Help identify and name emotions through conversations and activities that promote emotional literacy.",
        },
      },
      social: {
        severe: {
          title: "Social Skills Therapy",
          description: "Consider working with a speech-language pathologist or social skills specialist for targeted intervention.",
        },
        moderate: {
          title: "Social Skills Development",
          description: "Practice social skills through structured games, role-playing, and supervised peer interactions.",
        },
        mild: {
          title: "Social Interaction Opportunities",
          description: "Create safe opportunities for peer interaction through clubs, group activities, or classes aligned with interests.",
        },
      },
      behavioral: {
        severe: {
          title: "Behavioral Intervention Plan",
          description: "Work with school or professional behaviorist to develop a comprehensive behavior management plan.",
        },
        moderate: {
          title: "Positive Behavior Support",
          description: "Use clear expectations, consistent consequences, and positive reinforcement to manage behavior.",
        },
        mild: {
          title: "Behavior Reinforcement",
          description: "Acknowledge positive behaviors and provide structured guidance for challenging situations.",
        },
      },
      learning: {
        severe: {
          title: "Comprehensive Learning Evaluation",
          description: "Request a formal psychoeducational evaluation to identify specific learning disabilities or differences.",
        },
        moderate: {
          title: "Learning Support and Accommodations",
          description: "Work with school to implement appropriate accommodations such as extra time, alternative formats, or assistive technology.",
        },
        mild: {
          title: "Supplemental Academic Support",
          description: "Provide targeted tutoring or additional practice in areas where learning is challenging.",
        },
      },
    };

    const priorityMap = { severe: "high" as const, moderate: "medium" as const, mild: "low" as const };

    if (domainRecommendations[domain] && domainRecommendations[domain][severity]) {
      const rec = domainRecommendations[domain][severity];
      recommendations.push({
        domain,
        title: rec.title,
        description: rec.description,
        priority: priorityMap[severity as keyof typeof priorityMap],
      });
    }
  });

  return recommendations;
}
