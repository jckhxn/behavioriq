import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

// GET /api/admin/assessment-templates/[id]/versions - Get version history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const versions = await prisma.assessmentTemplateVersion.findMany({
      where: { assessmentTemplateId: id },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { version: "desc" },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("Error fetching assessment template versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    );
  }
}

// POST /api/admin/assessment-templates/[id]/versions - Restore to specific version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { version } = await request.json();

    // Get the version to restore
    const versionToRestore = await prisma.assessmentTemplateVersion.findUnique({
      where: {
        assessmentTemplateId_version: {
          assessmentTemplateId: id,
          version: parseInt(version),
        },
      },
    });

    if (!versionToRestore) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Get the current template
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

    // Create a new version from current state before restoring
    await createVersionSnapshot(
      currentTemplate,
      user.id,
      `Restored to version ${version}`
    );

    // Parse the domain snapshot
    const domainSnapshot = versionToRestore.domainSnapshot as any;

    // Update the template with the restored version data
    await prisma.$transaction(async (tx) => {
      // Update the template
      await tx.assessmentTemplate.update({
        where: { id },
        data: {
          name: versionToRestore.name,
          slug: versionToRestore.slug,
          description: versionToRestore.description,
          instructions: versionToRestore.instructions,
          isActive: versionToRestore.isActive,
          version: currentTemplate.version + 1,
        },
      });

      // Remove current domain relationships
      await tx.assessmentTemplateDomain.deleteMany({
        where: { assessmentTemplateId: id },
      });

      // Restore domain relationships from snapshot
      if (domainSnapshot?.domains) {
        await tx.assessmentTemplateDomain.createMany({
          data: domainSnapshot.domains.map((domain: any) => ({
            assessmentTemplateId: id,
            domainTemplateId: domain.domainTemplateId,
            order: domain.order,
            isRequired: domain.isRequired,
          })),
        });
      }
    });

    return NextResponse.json({ message: "Template restored successfully" });
  } catch (error) {
    console.error("Error restoring assessment template version:", error);
    return NextResponse.json(
      { error: "Failed to restore version" },
      { status: 500 }
    );
  }
}

async function createVersionSnapshot(
  template: any,
  userId: string,
  changeDescription?: string
) {
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
