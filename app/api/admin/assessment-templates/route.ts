import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

// GET /api/admin/assessment-templates - Get assessment templates based on user role
export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let whereClause = {};

    // District Admins can only see templates they created for their sub-accounts
    if (user.role === "DISTRICT_ADMIN") {
      whereClause = {
        createdById: user.id,
      };
    }
    // Super Admins and regular Admins can see all templates

    const templates = await prisma.assessmentTemplate.findMany({
      where: whereClause,
      include: {
        domains: {
          include: {
            domainTemplate: true,
          },
          orderBy: { order: "asc" },
        },
        createdBy: {
          select: { name: true, email: true },
        },
        _count: {
          select: { assessments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching assessment templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment templates" },
      { status: 500 }
    );
  }
}

// POST /api/admin/assessment-templates - Create new assessment template
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug, description, instructions, isActive, domainIds } =
      await request.json();

    if (!name || !slug || !domainIds || domainIds.length === 0) {
      return NextResponse.json(
        { error: "Name, slug, and at least one domain are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTemplate = await prisma.assessmentTemplate.findUnique({
      where: { slug },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: "Assessment with this slug already exists" },
        { status: 409 }
      );
    }

    const willBeActive = isActive !== undefined ? isActive : true;

    // If creating as active, deactivate all other assessments (EXCEPT the trial assessment)
    if (willBeActive) {
      // Get platform settings to identify the trial assessment
      const platformSettings = await (prisma as any).platformSettings.findFirst(
        {
          select: { globalTrialAssessmentId: true },
        }
      );

      const whereClause: any = { isActive: true };

      // Exclude the trial assessment from deactivation
      if (platformSettings?.globalTrialAssessmentId) {
        whereClause.id = { not: platformSettings.globalTrialAssessmentId };
        console.log(
          `[ASSESSMENT-TEMPLATES] Preserving trial assessment (${platformSettings.globalTrialAssessmentId}) while deactivating other regular assessments`
        );
      }

      await prisma.assessmentTemplate.updateMany({
        where: whereClause,
        data: { isActive: false },
      });
    }

    const template = await prisma.assessmentTemplate.create({
      data: {
        name,
        slug,
        description,
        instructions,
        isActive: willBeActive,
        createdById: user.id,
        domains: {
          create: domainIds.map((domainId: string, index: number) => ({
            domainTemplateId: domainId,
            order: index,
          })),
        },
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        domains: {
          include: {
            domainTemplate: true,
          },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating assessment template:", error);
    return NextResponse.json(
      { error: "Failed to create assessment template" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/assessment-templates - Update assessment template
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id,
      name,
      slug,
      description,
      instructions,
      isActive,
      domainIds,
      domains,
      changeDescription,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Get current template for version snapshot
    const currentTemplate = await prisma.assessmentTemplate.findUnique({
      where: { id },
      include: { domains: true },
    });

    if (!currentTemplate) {
      return NextResponse.json(
        { error: "Assessment template not found" },
        { status: 404 }
      );
    }

    // TODO: Fix version snapshot system - temporarily disabled
    // await createVersionSnapshot(
    //   currentTemplate,
    //   session.user.id,
    //   changeDescription
    // );

    // If setting this assessment to active, deactivate all other assessments (EXCEPT the trial assessment)
    if (isActive && !currentTemplate.isActive) {
      // Get platform settings to identify the trial assessment
      const platformSettings = await (prisma as any).platformSettings.findFirst(
        {
          select: { globalTrialAssessmentId: true },
        }
      );

      const whereClause: any = {
        id: { not: id },
        isActive: true,
      };

      // Exclude the trial assessment from deactivation
      if (platformSettings?.globalTrialAssessmentId) {
        whereClause.id = {
          notIn: [id, platformSettings.globalTrialAssessmentId],
        };
        console.log(
          `[ASSESSMENT-TEMPLATES] Preserving trial assessment (${platformSettings.globalTrialAssessmentId}) while deactivating other regular assessments`
        );
      }

      await prisma.assessmentTemplate.updateMany({
        where: whereClause,
        data: { isActive: false },
      });
    }

    const updateData: any = {
      name,
      slug,
      description,
      instructions,
      isActive,
      // version: currentTemplate.version + 1, // Version increment disabled with snapshot system
    };

    // If domains or domainIds are provided, update the domain relationships
    if (domains || domainIds) {
      updateData.domains = {
        deleteMany: {}, // Remove all existing domain relationships
        create: domains
          ? domains.map((domain: any) => ({
              domainTemplateId: domain.domainTemplateId,
              order: domain.order,
            }))
          : domainIds.map((domainId: string, index: number) => ({
              domainTemplateId: domainId,
              order: index + 1, // Use 1-based ordering
            })),
      };
    }

    const template = await prisma.assessmentTemplate.update({
      where: { id },
      data: updateData,
      include: {
        domains: {
          include: {
            domainTemplate: true,
          },
          orderBy: { order: "asc" },
        },
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating assessment template:", error);
    return NextResponse.json(
      { error: "Failed to update assessment template" },
      { status: 500 }
    );
  }
}

async function createVersionSnapshot(
  template: any,
  userId: string,
  changeDescription?: string
) {
  // Check if version snapshot already exists
  const existingVersion = await prisma.assessmentTemplateVersion.findUnique({
    where: {
      assessmentTemplateId_version: {
        assessmentTemplateId: template.id,
        version: template.version,
      },
    },
  });

  // Only create snapshot if it doesn't exist
  if (!existingVersion) {
    // Create domain snapshot
    const domainSnapshot = {
      domains: template.domains.map((domain: any) => ({
        domainTemplateId: domain.domainTemplateId,
        order: domain.order,
        isRequired: domain.isRequired,
      })),
    };

    await prisma.assessmentTemplateVersion.create({
      data: {
        assessmentTemplateId: template.id,
        version: template.version,
        name: template.name,
        slug: template.slug,
        description: template.description,
        instructions: template.instructions,
        isActive: template.isActive,
        domainSnapshot,
        changeDescription,
        createdById: userId,
      },
    });
  }
}
