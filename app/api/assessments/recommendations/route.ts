/**
 * AI Recommendations API
 *
 * Generates AI-powered recommendations based on assessment results
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateAIResponse } from "@/lib/ai/openai";
import { SYSTEM_PROMPTS } from "@/lib/config/ai-config";

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
    domains: assessment.scores.map((score: any) => {
      const percentage = score.totalPossible
        ? Math.round((score.rawScore / score.totalPossible) * 1000) / 10
        : 0;

      return {
        domain: score.domain,
        domainLabel: formatDomainName(score.domain),
        rawScore: score.rawScore,
        totalPossible: score.totalPossible,
        percentage,
        riskLevel: score.riskLevel,
        confidence: score.confidence,
        wasTerminatedEarly: score.wasTerminatedEarly,
      };
    }),
    totalResponses: assessment.responses.length,
    overallRiskLevel: calculateOverallRisk(assessment.scores),
  };

  const riskPriority = {
    VERY_HIGH: 3,
    HIGH: 2,
    MODERATE: 1,
    LOW: 0,
  } as Record<string, number>;

  const sortedDomains = [...assessmentSummary.domains].sort((a, b) => {
    const riskDiff = (riskPriority[b.riskLevel] || 0) - (riskPriority[a.riskLevel] || 0);
    if (riskDiff !== 0) return riskDiff;
    return (b.percentage || 0) - (a.percentage || 0);
  });

  const topDomainInput = sortedDomains.slice(0, 3).map((domain) => ({
    domainName: domain.domainLabel,
    percentage: domain.percentage ?? 0,
    riskLevel: domain.riskLevel,
  }));

  const completedDate = assessmentSummary.completedAt
    ? new Date(assessmentSummary.completedAt)
    : new Date(assessment.startedAt);

  const contextBlock = `CONTEXT:\nSubject: ${assessmentSummary.subjectName || "Participant"}\nCompleted: ${completedDate.toLocaleDateString()}\nOverall Risk: ${assessmentSummary.overallRiskLevel}\nTotal Questions Answered: ${assessmentSummary.totalResponses}`;

  const prompt = `${SYSTEM_PROMPTS.ASSESSMENT_ANALYSIS.trim()}\n\n${contextBlock}\n\nINPUT DATA:\n${JSON.stringify(topDomainInput, null, 2)}`;

  try {
    const response = await generateAIResponse(prompt, {
      temperature: 0.3, // Lower temperature for more consistent clinical recommendations
      maxTokens: 1500,
    });

    return response;
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    return `##SECTION: Overview
The automated recommendation engine is temporarily unavailable. Please review this assessment with a licensed behavioral health professional and focus on the domains with the highest risk scores.

---

##SECTION: Priority Areas
### **Overall Review** *(N/A - Manual Follow-up Required)*
Consult with a behavioral health professional to interpret domain percentages and determine next steps.

---

##SECTION: Actions
### **Overall Plan**
**Steps:**  \\\n+1. Schedule a consultation with a licensed therapist or psychologist to create a tailored care plan.  \\\n+2. Maintain a daily log tracking mood, triggers, and coping strategies.

**Approach:**  \\\n+Cognitive Behavioral Therapy (CBT) or Acceptance and Commitment Therapy (ACT).

**Tools:**  \\\n+[APA Therapist Locator](https://locator.apa.org)  \\
[MoodMission](https://moodmission.com)

---

##SECTION: Monitor
- **Daily:** Document stressors, coping strategies, and any safety concerns.  \\\n+- **Weekly:** Review progress with a clinician or structured reflection worksheet.  \\\n+- **Alert:** Contact 911 or 988 immediately if safety concerns escalate or rapid symptom changes occur.

---

##SECTION: Support
- **Who:** Licensed therapist, psychologist, or psychiatrist.  \\\n+- **Crisis:** Call 911 for emergencies or 988 for suicide and crisis support.  \\\n+- **Urgency:** Elevated—prioritize professional follow-up based on the highest domain risk.
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

function formatDomainName(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
