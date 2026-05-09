import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await params;

    const template = await (prisma as any).assessmentTemplate.findUnique({
      where: { id: templateId },
      include: {
        domains: {
          include: { domainTemplate: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const configs = template.domains
      .map((d: any, index: number) => {
        const dt = d.domainTemplate;
        if (!dt) return null;

        // Parse questions leniently
        let questions: any[] = [];
        try {
          questions = Array.isArray(dt.questions)
            ? dt.questions
            : typeof dt.questions === "string"
            ? JSON.parse(dt.questions)
            : [];
        } catch {
          questions = [];
        }

        if (questions.length === 0) return null;

        // Parse scoring config leniently
        let scoringConfig: any = {};
        try {
          scoringConfig =
            typeof dt.scoringConfig === "object" && dt.scoringConfig !== null
              ? dt.scoringConfig
              : typeof dt.scoringConfig === "string"
              ? JSON.parse(dt.scoringConfig)
              : {};
        } catch {
          scoringConfig = {};
        }

        const mappedQuestions = questions.map((q: any, qi: number) => ({
          id: q.id || `q_${index}_${qi}`,
          text: q.text || q.title || `Question ${qi + 1}`,
          order: typeof q.order === "number" ? q.order : qi,
          weight: typeof q.weight === "number" ? q.weight : 1,
          isGatingQuestion: Boolean(q.isGatingQuestion),
          skipLogic: q.skipLogic ?? null,
          category: q.category ?? null,
        }));

        return {
          name: dt.name,
          displayName: dt.name,
          description: dt.description || "",
          // Use slug if present, otherwise derive one from the name
          domain: dt.slug || dt.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          order: d.order ?? index,
          totalPossibleScore:
            scoringConfig.maxScore ??
            scoringConfig.totalPossibleScore ??
            mappedQuestions.length,
          clinicallySignificantScore:
            scoringConfig.significantScore ??
            scoringConfig.clinicallySignificantScore ??
            Math.ceil(mappedQuestions.length * 0.6),
          questions: mappedQuestions,
          skipConditions: [],
          prerequisites: [],
          terminationRules: [],
          multiPartLogic: undefined,
          resources: dt.resources ?? undefined,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ configs, domainTemplateMap: {} });
  } catch (error) {
    console.error("Error loading assessment preview config:", error);
    return NextResponse.json(
      { error: "Failed to load assessment preview" },
      { status: 500 }
    );
  }
}
