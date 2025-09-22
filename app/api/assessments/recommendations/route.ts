/**
 * AI Recommendations API
 *
 * Generates AI-powered recommendations based on assessment results
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateAIResponse } from "@/lib/ai/openai";

export async function POST(request: NextRequest) {
  try {
    const { assessmentId } = await request.json();

    // Fetch assessment with complete data
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        scores: true,
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

    if (assessment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment must be completed to generate recommendations" },
        { status: 400 }
      );
    }

    // Generate AI recommendations
    const recommendations = await generateRecommendations(assessment);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

async function generateRecommendations(assessment: any): Promise<string> {
  // Prepare assessment data for AI analysis
  const assessmentSummary = {
    subjectName: assessment.subjectName,
    completedAt: assessment.completedAt,
    domains: assessment.scores.map((score: any) => ({
      domain: score.domain,
      rawScore: score.rawScore,
      totalPossible: score.totalPossible,
      riskLevel: score.riskLevel,
      confidence: score.confidence,
      wasTerminatedEarly: score.wasTerminatedEarly,
    })),
    totalResponses: assessment.responses.length,
    overallRiskLevel: calculateOverallRisk(assessment.scores),
  };

  const prompt = `
As a clinical psychology expert, analyze this behavioral assessment and provide comprehensive, actionable recommendations.

Assessment Summary:
Subject: ${assessmentSummary.subjectName}
Completed: ${new Date(assessmentSummary.completedAt).toLocaleDateString()}
Overall Risk Level: ${assessmentSummary.overallRiskLevel}
Total Questions Answered: ${assessmentSummary.totalResponses}

Domain Scores:
${assessmentSummary.domains
  .map(
    (domain: any) =>
      `- ${domain.domain}: ${domain.rawScore}/${domain.totalPossible} (${domain.riskLevel} risk, ${Math.round(domain.confidence * 100)}% confidence)${domain.wasTerminatedEarly ? " [Early termination]" : ""}`
  )
  .join("\n")}

Please provide:

1. **Immediate Concerns**: Any high-risk areas requiring immediate attention
2. **Clinical Recommendations**: Specific interventions, therapies, or treatments to consider
3. **Monitoring Guidelines**: What to watch for and how often to reassess
4. **Referral Suggestions**: When to refer to specialists (psychiatrists, therapists, etc.)
5. **Environmental Considerations**: Family, school, or workplace modifications
6. **Follow-up Timeline**: Recommended schedule for progress monitoring

Format your response as clear, professional recommendations suitable for clinical documentation. Focus on evidence-based interventions and practical next steps.
`;

  try {
    const response = await generateAIResponse(prompt, {
      temperature: 0.3, // Lower temperature for more consistent clinical recommendations
      maxTokens: 1500,
    });

    return response;
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    return `
RECOMMENDATIONS SUMMARY

Based on the assessment results showing ${assessmentSummary.overallRiskLevel} overall risk level across ${assessmentSummary.domains.length} domains:

IMMEDIATE CONCERNS:
${
  assessmentSummary.domains
    .filter((d: any) => d.riskLevel === "HIGH" || d.riskLevel === "VERY_HIGH")
    .map(
      (d: any) =>
        `- ${d.domain}: Elevated risk (${d.rawScore}/${d.totalPossible})`
    )
    .join("\n") || "- No immediate high-risk concerns identified"
}

CLINICAL RECOMMENDATIONS:
- Comprehensive clinical interview with qualified mental health professional
- Consider structured diagnostic assessment if indicated
- Develop individualized treatment plan based on specific risk factors
- Regular progress monitoring and assessment updates

FOLLOW-UP:
- Reassess within 30-60 days or sooner if symptoms worsen
- Monitor response to interventions
- Adjust treatment plan based on progress

Note: These are preliminary recommendations. Professional clinical judgment and comprehensive evaluation are essential for accurate diagnosis and treatment planning.
`;
  }
}

function calculateOverallRisk(scores: any[]): string {
  if (scores.length === 0) return "LOW";

  const riskValues = { LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 };
  const averageRisk =
    scores.reduce(
      (sum, score) =>
        sum + riskValues[score.riskLevel as keyof typeof riskValues],
      0
    ) / scores.length;

  if (averageRisk >= 3.5) return "VERY_HIGH";
  if (averageRisk >= 2.5) return "HIGH";
  if (averageRisk >= 1.5) return "MODERATE";
  return "LOW";
}
