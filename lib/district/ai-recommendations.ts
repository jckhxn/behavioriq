/**
 * AI Recommendations Engine for District Students
 * Generates conservative, evidence-based recommendations for K-12 students
 *
 * CRITICAL: This generates recommendations for school use only
 * - Conservative language (no diagnosis)
 * - Evidence-based strategies
 * - Age-appropriate guidance
 * - FERPA-compliant output
 */

import { getChatCompletion } from "@/lib/ai/openai";
import { prisma } from "@/lib/db/prisma";

export interface DomainScore {
  domain: string;
  rawScore: number;
  riskLevel: string;
  totalPossible: number;
}

export interface RecommendationInput {
  domainScores: DomainScore[];
  gradeLevel?: string;
  ageBand?: string;
  riskTier: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
}

export interface RecommendationOutput {
  summary: string;
  schoolStrategies: string[];
  classroomAccommodations: string[];
  parentNextSteps: string[];
  referralGuidance: string;
}

/**
 * Generate AI recommendations based on assessment results
 */
export async function generateRecommendations(
  input: RecommendationInput
): Promise<RecommendationOutput> {
  const { domainScores, gradeLevel, ageBand, riskTier } = input;

  // Build context for AI
  const domainSummary = domainScores
    .map(
      (d) => `${d.domain}: ${d.rawScore}/${d.totalPossible} (${d.riskLevel})`
    )
    .join("\n");

  const systemPrompt = `You are an expert school psychologist providing evidence-based recommendations for K-12 educators.

CRITICAL CONSTRAINTS:
- NEVER use diagnostic language (e.g., "this student has ADHD")
- ALWAYS use screening/behavioral observation language
- Ground recommendations in research (CDC, CASEL, NIH, DSM-informed but not diagnostic)
- Be conservative and professional
- Focus on school-appropriate interventions
- Recommend professional referral when scores indicate higher risk

TONE: Compassionate, professional, actionable, non-alarmist

OUTPUT FORMAT: Valid JSON only, no markdown, no code blocks`;

  const userPrompt = `Generate recommendations for a ${gradeLevel || "elementary"} student with the following behavioral screening results:

${domainSummary}

Overall Risk Tier: ${riskTier}
Age/Grade: ${ageBand || gradeLevel || "K-5"}

Provide JSON output with this structure:
{
  "summary": "2-3 sentence plain-language overview of the screening results",
  "schoolStrategies": ["strategy 1", "strategy 2", "strategy 3"],
  "classroomAccommodations": ["accommodation 1", "accommodation 2", "accommodation 3"],
  "parentNextSteps": ["next step 1", "next step 2", "next step 3"],
  "referralGuidance": "Clear guidance on when and how to escalate (e.g., school counselor, IEP team, outside clinician)"
}

Guidelines:
- Summary: Use screening language ("elevated scores in...", "may benefit from...")
- School Strategies: Evidence-based school-wide or team-based interventions
- Classroom Accommodations: Practical, teacher-implementable supports
- Parent Next Steps: Actionable guidance for families
- Referral Guidance: Conservative threshold for professional evaluation

Cite frameworks where appropriate (e.g., MTSS, PBIS, SEL competencies)`;

  const response = await getChatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  let parsedResponse: RecommendationOutput;
  try {
    // Remove markdown code blocks if present
    let content = response.trim();
    if (content.startsWith("```json")) {
      content = content.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (content.startsWith("```")) {
      content = content.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    parsedResponse = JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse AI response:", response);
    // Fallback to generic recommendations
    parsedResponse = getFallbackRecommendations(riskTier);
  }

  return parsedResponse;
}

/**
 * Save recommendations to database
 */
export async function saveRecommendations(
  studentId: string,
  assessmentId: string,
  recommendations: RecommendationOutput
): Promise<void> {
  await prisma.studentRecommendation.upsert({
    where: {
      studentId_assessmentId: {
        studentId,
        assessmentId,
      },
    },
    create: {
      studentId,
      assessmentId,
      summary: recommendations.summary,
      schoolStrategies: recommendations.schoolStrategies,
      classroomAccommodations: recommendations.classroomAccommodations,
      parentNextSteps: recommendations.parentNextSteps,
      referralGuidance: recommendations.referralGuidance || null,
      generatedBy: "AI",
    },
    update: {
      summary: recommendations.summary,
      schoolStrategies: recommendations.schoolStrategies,
      classroomAccommodations: recommendations.classroomAccommodations,
      parentNextSteps: recommendations.parentNextSteps,
      referralGuidance: recommendations.referralGuidance || null,
      generatedAt: new Date(),
    },
  });
}

/**
 * Fallback recommendations if AI fails
 */
function getFallbackRecommendations(
  riskTier: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH"
): RecommendationOutput {
  const baseRecommendations = {
    summary:
      "This screening indicates behavioral patterns that may benefit from additional support.",
    schoolStrategies: [
      "Implement tiered support through MTSS framework",
      "Monitor behavioral patterns through regular check-ins",
      "Provide social-emotional learning opportunities",
    ],
    classroomAccommodations: [
      "Offer preferential seating near positive peer models",
      "Provide clear expectations with visual supports",
      "Use positive reinforcement strategies",
    ],
    parentNextSteps: [
      "Schedule a meeting with school counselor or psychologist",
      "Maintain open communication with teachers",
      "Consider community resources for additional support",
    ],
    referralGuidance: "",
  };

  switch (riskTier) {
    case "VERY_HIGH":
    case "HIGH":
      baseRecommendations.referralGuidance =
        "Scores indicate the need for immediate school-based team review. Recommend scheduling a Student Support Team (SST) or IEP eligibility meeting. Consider referral to school psychologist for comprehensive evaluation and/or outside mental health professional.";
      baseRecommendations.schoolStrategies.push(
        "Convene student support team within 5 school days"
      );
      break;
    case "MODERATE":
      baseRecommendations.referralGuidance =
        "Scores suggest benefit from Tier 2 interventions. Monitor progress over 6-8 weeks. If concerns persist or intensify, schedule meeting with school counselor for further assessment.";
      break;
    case "LOW":
      baseRecommendations.referralGuidance =
        "Continue universal supports (Tier 1). No immediate referral needed, but continue to monitor as part of regular developmental screening.";
      break;
  }

  return baseRecommendations;
}

/**
 * Get recommendations for a student assessment
 */
export async function getRecommendations(
  studentId: string,
  assessmentId: string
): Promise<RecommendationOutput | null> {
  const recommendation = await prisma.studentRecommendation.findUnique({
    where: {
      studentId_assessmentId: {
        studentId,
        assessmentId,
      },
    },
  });

  if (!recommendation) return null;

  return {
    summary: recommendation.summary,
    schoolStrategies: recommendation.schoolStrategies as string[],
    classroomAccommodations: recommendation.classroomAccommodations as string[],
    parentNextSteps: recommendation.parentNextSteps as string[],
    referralGuidance: recommendation.referralGuidance || "",
  };
}

/**
 * Determine risk tier from scores
 */
export function determineRiskTier(
  domainScores: DomainScore[]
): "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" {
  const maxScore = Math.max(...domainScores.map((d) => d.rawScore));
  const averageScore =
    domainScores.reduce((sum, d) => sum + d.rawScore, 0) / domainScores.length;
  const elevatedCount = domainScores.filter((d) => d.rawScore >= 70).length;

  if (maxScore >= 90 || elevatedCount >= 3) return "VERY_HIGH";
  if (maxScore >= 80 || elevatedCount >= 2) return "HIGH";
  if (maxScore >= 70 || elevatedCount >= 1) return "MODERATE";
  if (averageScore >= 60) return "MODERATE";
  return "LOW";
}
