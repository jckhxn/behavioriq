import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface AssessmentAnswerPayload {
  responses: Record<string, boolean>;
  subjectName?: string;
}

const RISK_THRESHOLDS = {
  LOW: 30,
  MODERATE: 60,
};

function mapRiskLevel(percentage: number): "low" | "moderate" | "high" {
  if (percentage <= RISK_THRESHOLDS.LOW) {
    return "low";
  }
  if (percentage <= RISK_THRESHOLDS.MODERATE) {
    return "moderate";
  }
  return "high";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;

    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
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

    if (!template) {
      return NextResponse.json(
        { error: "Assessment template not found" },
        { status: 404 }
      );
    }

    if (!template.isActive) {
      return NextResponse.json(
        { error: "Assessment template is currently inactive" },
        { status: 403 }
      );
    }

    const questions = template.domains
      .flatMap((domain, domainIndex) => {
        const domainQuestions = (domain.domainTemplate.questions || []) as any[];

        return domainQuestions.map((question: any, questionIndex: number) => ({
          id: question.id,
          prompt: question.text,
          domain: domain.domainTemplate.name,
          domainSlug: domain.domainTemplate.slug,
          weight: question.weight || 1,
          order: domainIndex * 100 + questionIndex,
        }));
      })
      .sort((a, b) => a.order - b.order);

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        instructions: template.instructions,
        totalQuestions: questions.length,
      },
      questions,
    });
  } catch (error) {
    console.error("[ChatGPT Assessment] Failed to load template:", error);
    return NextResponse.json(
      { error: "Failed to load assessment template" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    const body = (await request.json()) as AssessmentAnswerPayload;

    if (!body || !body.responses || typeof body.responses !== "object") {
      return NextResponse.json(
        { error: "responses object is required" },
        { status: 400 }
      );
    }

    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
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
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Assessment template not found" },
        { status: 404 }
      );
    }

    const questionLookup = new Map<
      string,
      {
        domain: string;
        domainSlug: string;
        weight: number;
      }
    >();

    template.domains.forEach((domain) => {
      const domainQuestions = (domain.domainTemplate.questions || []) as any[];
      domainQuestions.forEach((question: any) => {
        questionLookup.set(question.id, {
          domain: domain.domainTemplate.name,
          domainSlug: domain.domainTemplate.slug,
          weight: question.weight || 1,
        });
      });
    });

    const domainScores = new Map<
      string,
      { name: string; yes: number; total: number }
    >();
    const unanswered: string[] = [];

    Object.entries(body.responses).forEach(([questionId, value]) => {
      const metadata = questionLookup.get(questionId);

      if (!metadata) {
        unanswered.push(questionId);
        return;
      }

      if (!domainScores.has(metadata.domainSlug)) {
        domainScores.set(metadata.domainSlug, {
          name: metadata.domain,
          yes: 0,
          total: 0,
        });
      }

      const entry = domainScores.get(metadata.domainSlug)!;
      entry.total += metadata.weight;
      if (value) {
        entry.yes += metadata.weight;
      }
    });

    const domainResults = Array.from(domainScores.entries()).map(
      ([domainSlug, score]) => {
        const percentage =
          score.total === 0 ? 0 : Math.round((score.yes / score.total) * 100);
        return {
          domainSlug,
          domainName: score.name,
          yes: score.yes,
          total: score.total,
          percentage,
          riskLevel: mapRiskLevel(percentage),
        };
      }
    );

    const overallPercentage =
      domainResults.length === 0
        ? 0
        : Math.round(
            domainResults.reduce((sum, domain) => sum + domain.percentage, 0) /
              domainResults.length
          );

    return NextResponse.json({
      subjectName: body.subjectName || "participant",
      domainResults,
      overall: {
        percentage: overallPercentage,
        riskLevel: mapRiskLevel(overallPercentage),
      },
      unansweredQuestionIds: unanswered,
      totalAnswered: Object.keys(body.responses).length,
      totalDomains: domainResults.length,
    });
  } catch (error) {
    console.error("[ChatGPT Assessment] Failed to score responses:", error);
    return NextResponse.json(
      { error: "Failed to score assessment responses" },
      { status: 500 }
    );
  }
}

