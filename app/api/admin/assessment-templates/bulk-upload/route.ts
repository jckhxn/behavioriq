import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

interface BulkAssessmentUpload {
  name: string;
  description: string;
  version?: string;
  instructions?: string;
  domains: Array<{
    name: string;
    description: string;
    questions: Array<{
      id: string;
      text: string;
      order: number;
      weight?: number;
      isGatingQuestion?: boolean;
      skipLogic?: any;
      category?: string;
    }>;
    scoringConfig: {
      maxScore: number;
      significantScore: number;
      riskLevels: {
        low: { min: number; max: number };
        moderate: { min: number; max: number };
        high: { min: number; max: number };
      };
      specialScoring?: any;
    };
    resources?: Array<{
      title: string;
      description: string;
      url?: string;
      category: string;
    }>;
  }>;
  metadata?: {
    totalQuestions?: number;
    estimatedTime?: string;
    riskCategories?: string[];
    specialInstructions?: any;
  };
}

// POST /api/admin/assessment-templates/bulk-upload - Bulk upload complete assessment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".json")) {
      return NextResponse.json(
        { error: "Only JSON files are supported" },
        { status: 400 }
      );
    }

    const content = await file.text();
    let assessmentData: BulkAssessmentUpload;

    try {
      assessmentData = JSON.parse(content);
      console.log(
        "Parsed assessment data:",
        JSON.stringify(assessmentData, null, 2)
      );
    } catch (error) {
      console.error("JSON parsing error:", error);
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    // Validate required fields
    console.log("Validating assessment structure:", {
      hasName: !!assessmentData.name,
      name: assessmentData.name,
      hasDomains: !!assessmentData.domains,
      isDomainsArray: Array.isArray(assessmentData.domains),
      domainsLength: assessmentData.domains?.length || 0,
    });

    if (
      !assessmentData.name ||
      !assessmentData.domains ||
      !Array.isArray(assessmentData.domains)
    ) {
      console.error("Basic validation failed:", {
        hasName: !!assessmentData.name,
        hasDomains: !!assessmentData.domains,
        isDomainsArray: Array.isArray(assessmentData.domains),
      });
      return NextResponse.json(
        { error: "Assessment must have a name and domains array" },
        { status: 400 }
      );
    }

    if (assessmentData.domains.length === 0) {
      console.error("No domains provided");
      return NextResponse.json(
        { error: "Assessment must have at least one domain" },
        { status: 400 }
      );
    }

    // Validate each domain
    for (let i = 0; i < assessmentData.domains.length; i++) {
      const domain = assessmentData.domains[i];
      console.log(`Validating domain ${i + 1}:`, domain.name);

      if (
        !domain.name ||
        !domain.questions ||
        !Array.isArray(domain.questions)
      ) {
        console.error(`Domain validation failed for domain ${i + 1}:`, {
          hasName: !!domain.name,
          hasQuestions: !!domain.questions,
          isQuestionsArray: Array.isArray(domain.questions),
        });
        return NextResponse.json(
          {
            error: `Domain "${domain.name || "unnamed"}" must have a name and questions array`,
          },
          { status: 400 }
        );
      }

      if (domain.questions.length === 0) {
        console.error(`Domain ${domain.name} has no questions`);
        return NextResponse.json(
          { error: `Domain "${domain.name}" must have at least one question` },
          { status: 400 }
        );
      }

      if (
        !domain.scoringConfig ||
        typeof domain.scoringConfig.maxScore !== "number"
      ) {
        console.error(
          `Domain ${domain.name} scoring config validation failed:`,
          {
            hasScoringConfig: !!domain.scoringConfig,
            maxScore: domain.scoringConfig?.maxScore,
            maxScoreType: typeof domain.scoringConfig?.maxScore,
          }
        );
        return NextResponse.json(
          {
            error: `Domain "${domain.name}" must have valid scoring configuration with numeric maxScore`,
          },
          { status: 400 }
        );
      }

      console.log(`Domain ${domain.name} validated successfully`);
    }

    // Generate slug from name
    const assessmentSlug = assessmentData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    // Check if assessment template with this slug already exists
    const existingTemplate = await prisma.assessmentTemplate.findUnique({
      where: { slug: assessmentSlug },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: `Assessment with slug "${assessmentSlug}" already exists` },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create the assessment template
      const assessmentTemplate = await tx.assessmentTemplate.create({
        data: {
          name: assessmentData.name,
          slug: assessmentSlug,
          description: assessmentData.description,
          instructions: assessmentData.instructions || null,
          createdById: session.user.id,
          isActive: true,
        },
      });

      const createdDomains = [];

      // Create each domain template
      for (let i = 0; i < assessmentData.domains.length; i++) {
        const domainData = assessmentData.domains[i];

        const domainSlug = domainData.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();

        // Check if domain template with this slug already exists
        let domainTemplate = await tx.domainTemplate.findUnique({
          where: { slug: domainSlug },
        });

        if (!domainTemplate) {
          // Create new domain template
          domainTemplate = await tx.domainTemplate.create({
            data: {
              name: domainData.name,
              slug: domainSlug,
              description: domainData.description,
              questions: domainData.questions,
              scoringConfig: domainData.scoringConfig,
              resources: domainData.resources || [],
              createdById: session.user.id,
            },
          });
        }

        createdDomains.push(domainTemplate);

        // Link domain to assessment template
        await tx.assessmentTemplateDomain.create({
          data: {
            assessmentTemplateId: assessmentTemplate.id,
            domainTemplateId: domainTemplate.id,
            order: i + 1,
            isRequired: true,
          },
        });
      }

      // Create initial version snapshot
      const domainSnapshot = {
        domains: createdDomains.map((domain, index) => ({
          domainTemplateId: domain.id,
          order: index + 1,
          isRequired: true,
        })),
      };

      await tx.assessmentTemplateVersion.create({
        data: {
          assessmentTemplateId: assessmentTemplate.id,
          version: 1,
          name: assessmentTemplate.name,
          slug: assessmentTemplate.slug,
          description: assessmentTemplate.description,
          instructions: assessmentTemplate.instructions,
          isActive: assessmentTemplate.isActive,
          domainSnapshot,
          changeDescription: "Initial bulk upload",
          createdById: session.user.id,
        },
      });

      return {
        assessmentTemplate,
        domainsCreated: createdDomains.length,
        domainsReused: assessmentData.domains.length - createdDomains.length,
      };
    });

    return NextResponse.json({
      message: "Assessment uploaded successfully",
      assessmentId: result.assessmentTemplate.id,
      assessmentName: result.assessmentTemplate.name,
      domainsCreated: result.domainsCreated,
      domainsReused: result.domainsReused,
      totalDomains: assessmentData.domains.length,
    });
  } catch (error) {
    console.error("Error in bulk upload:", error);
    return NextResponse.json(
      { error: "Failed to upload assessment" },
      { status: 500 }
    );
  }
}
