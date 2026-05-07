import { prisma } from "@/lib/db/prisma";

export interface TrialTemplateQuestion {
  id: string;
  text: string;
  domain: string;
  domainSlug: string;
  order: number;
}

export interface TrialTemplateMeta {
  assessmentId: string;
  questions: TrialTemplateQuestion[];
  domains: Array<{ name: string; slug: string }>;
}

export async function getTrialTemplate(): Promise<TrialTemplateMeta | null> {
  const platformSettings = await prisma.platformSettings.findFirst({
    include: {
      globalTrialAssessment: {
        include: {
          domains: {
            include: { domainTemplate: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!platformSettings?.globalTrialAssessment || platformSettings.trialAssessmentsEnabled === false) {
    return null;
  }

  const assessment = platformSettings.globalTrialAssessment;
  if (!assessment.isActive) {
    return null;
  }

  // Filter questions by isTrial flag
  const questions = assessment.domains.flatMap((domain: any, domainIndex: number) => {
    const domainQuestions = domain.domainTemplate.questions as any[];
    return domainQuestions
      .filter((q: any) => q.isTrial === true) // ← FILTER FOR TRIAL QUESTIONS ONLY
      .map((question: any, questionIndex: number) => ({
        id: question.id,
        text: question.text,
        domain: domain.domainTemplate.name,
        domainSlug: domain.domainTemplate.slug,
        order: domainIndex * 100 + questionIndex,
      }));
  });

  questions.sort((a, b) => a.order - b.order);

  return {
    assessmentId: assessment.id,
    questions,
    domains: assessment.domains.map((domain: any) => ({
      name: domain.domainTemplate.name,
      slug: domain.domainTemplate.slug,
    })),
  };
}
