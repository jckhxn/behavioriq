import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/assessments/trial - Get trial assessment based on platform settings
 * Returns the globally configured trial assessment or a fallback message
 */
export async function GET(request: NextRequest) {
  try {
    // Get platform settings to find the global trial assessment
    const platformSettings = await prisma.platformSettings.findFirst({
      include: {
        globalTrialAssessment: {
          include: {
            domains: {
              include: {
                domainTemplate: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    // Check if trial assessments are enabled
    if (platformSettings && !platformSettings.trialAssessmentsEnabled) {
      return NextResponse.json(
        { error: "Trial assessments are currently disabled" },
        { status: 403 }
      );
    }

    // If no global trial assessment is set, return an error
    if (!platformSettings?.globalTrialAssessment) {
      return NextResponse.json(
        { error: "No trial assessment is currently configured" },
        { status: 404 }
      );
    }

    const trialAssessment = platformSettings.globalTrialAssessment;

    // Flatten the questions from all domains into a single array
    const questions = trialAssessment.domains.flatMap(
      (domain: any, domainIndex: number) => {
        const domainQuestions = domain.domainTemplate.questions as any[];
        return domainQuestions.map((question: any, questionIndex: number) => ({
          id: question.id,
          text: question.text,
          order: domainIndex * 100 + questionIndex, // Ensure proper ordering across domains
          domain: domain.domainTemplate.name,
          domainSlug: domain.domainTemplate.slug,
          weight: question.weight || 1,
          required: question.required !== false,
        }));
      }
    );

    // Sort questions by order
    questions.sort((a: any, b: any) => a.order - b.order);

    return NextResponse.json({
      assessment: {
        id: trialAssessment.id,
        name: trialAssessment.name,
        description: trialAssessment.description,
        instructions: trialAssessment.instructions,
        totalQuestions: questions.length,
      },
      domains: trialAssessment.domains.map((domain: any) => ({
        id: domain.domainTemplate.id,
        name: domain.domainTemplate.name,
        slug: domain.domainTemplate.slug,
        description: domain.domainTemplate.description,
        order: domain.order,
      })),
      questions: questions,
    });
  } catch (error) {
    console.error("Error fetching trial assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch trial assessment" },
      { status: 500 }
    );
  }
}
