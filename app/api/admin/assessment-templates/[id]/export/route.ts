import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

// GET /api/admin/assessment-templates/[id]/export - Export assessment template as JSON
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.assessmentTemplate.findUnique({
      where: { id },
      include: {
        domains: {
          include: {
            domainTemplate: {
              select: {
                slug: true,
                name: true,
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

    // Create export data structure
    const exportData = {
      name: template.name,
      slug: template.slug,
      description: template.description,
      instructions: template.instructions,
      isActive: template.isActive,
      domains: template.domains.map((d) => d.domainTemplate.slug),
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.email,
      version: template.version,
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${template.slug}-assessment-template.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting assessment template:", error);
    return NextResponse.json(
      { error: "Failed to export assessment template" },
      { status: 500 }
    );
  }
}
