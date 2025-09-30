import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

// GET /api/admin/domain-templates/[id]/export - Export domain template as JSON
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.domainTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Domain template not found" },
        { status: 404 }
      );
    }

    // Create export data structure
    const exportData = {
      name: template.name,
      slug: template.slug,
      description: template.description,
      questions: template.questions,
      resources: template.resources,
      scoringConfig: template.scoringConfig,
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.email,
      version: template.version,
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${template.slug}-domain-template.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting domain template:", error);
    return NextResponse.json(
      { error: "Failed to export domain template" },
      { status: 500 }
    );
  }
}
