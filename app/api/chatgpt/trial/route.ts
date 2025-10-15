import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getPlatformSettings } from "@/lib/platform/settings";

interface TrialAnswerPayload {
  answers: Record<string, boolean>;
  childName?: string;
}

export async function GET() {
  try {
    const settings = await getPlatformSettings();

    if (!settings) {
      return NextResponse.json(
        { error: "Platform settings not configured" },
        { status: 500 }
      );
    }

    if (!settings.trialAssessmentsEnabled) {
      return NextResponse.json(
        { error: "Trial assessments are currently disabled" },
        { status: 403 }
      );
    }

    if (!settings.globalTrialAssessmentId) {
      return NextResponse.json(
        { error: "No trial assessment template configured" },
        { status: 404 }
      );
    }

    const trialAssessment = await prisma.assessmentTemplate.findUnique({
      where: { id: settings.globalTrialAssessmentId },
      include: {
        domains: {
          include: {
            domainTemplate: {
              select: {
                id: true,
                name: true,
                slug: true,
                questions: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!trialAssessment) {
      return NextResponse.json(
        { error: "Trial assessment template not found" },
        { status: 404 }
      );
    }

    if (!trialAssessment.isActive) {
      return NextResponse.json(
        { error: "Trial assessment is currently inactive" },
        { status: 403 }
      );
    }

    const questions = trialAssessment.domains
      .flatMap((domain, domainIndex) => {
        const domainQuestions = (domain.domainTemplate.questions || []) as any[];

        return domainQuestions.map((question: any, questionIndex: number) => ({
          id: question.id,
          prompt: question.text,
          domain: domain.domainTemplate.name,
          domainSlug: domain.domainTemplate.slug,
          order: domainIndex * 100 + questionIndex,
          weight: question.weight || 1,
        }));
      })
      .sort((a, b) => a.order - b.order);

    return NextResponse.json({
      template: {
        id: trialAssessment.id,
        name: trialAssessment.name,
        description: trialAssessment.description,
        instructions: trialAssessment.instructions,
        totalQuestions: questions.length,
      },
      questions,
    });
  } catch (error) {
    console.error("[ChatGPT Trial] Failed to load trial template:", error);
    return NextResponse.json(
      { error: "Failed to fetch trial assessment" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrialAnswerPayload;
    if (!body || !body.answers || typeof body.answers !== "object") {
      return NextResponse.json(
        { error: "answers object is required" },
        { status: 400 }
      );
    }

    const answerEntries = Object.entries(body.answers).map(([key, value]) => ({
      id: Number(key),
      value: Boolean(value),
    }));

    if (answerEntries.length === 0) {
      return NextResponse.json(
        { error: "At least one answer is required" },
        { status: 400 }
      );
    }

    answerEntries.sort((a, b) => a.id - b.id);

    const totalQuestions = answerEntries.length;
    const yesResponses = answerEntries.filter((entry) => entry.value).length;

    // Approximate domain concerns using the same heuristic as TrialResults component
    const questionsPerDomain = Math.ceil(totalQuestions / 3);
    const attentionRange = { start: 1, end: questionsPerDomain };
    const conductRange = {
      start: questionsPerDomain + 1,
      end: questionsPerDomain * 2,
    };
    const emotionalRange = {
      start: conductRange.end + 1,
      end: totalQuestions,
    };

    const attentionConcerns = answerEntries.filter(
      (entry) =>
        entry.value &&
        entry.id >= attentionRange.start &&
        entry.id <= attentionRange.end
    ).length;
    const conductConcerns = answerEntries.filter(
      (entry) =>
        entry.value &&
        entry.id >= conductRange.start &&
        entry.id <= conductRange.end
    ).length;
    const emotionalConcerns = answerEntries.filter(
      (entry) =>
        entry.value &&
        entry.id >= emotionalRange.start &&
        entry.id <= emotionalRange.end
    ).length;

    const yesPercentage = (yesResponses / totalQuestions) * 100;
    let riskLevel: "low" | "moderate" | "high";
    if (yesPercentage <= 30) {
      riskLevel = "low";
    } else if (yesPercentage <= 60) {
      riskLevel = "moderate";
    } else {
      riskLevel = "high";
    }

    return NextResponse.json({
      summary: {
        childName: body.childName || "participant",
        totalIndicators: totalQuestions,
        identifiedIndicators: yesResponses,
        attentionConcerns,
        conductConcerns,
        emotionalConcerns,
        riskLevel,
      },
      raw: {
        yesPercentage,
        answers: answerEntries,
      },
    });
  } catch (error) {
    console.error("[ChatGPT Trial] Failed to score responses:", error);
    return NextResponse.json(
      { error: "Failed to score trial assessment" },
      { status: 500 }
    );
  }
}

