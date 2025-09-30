import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

// DELETE /api/admin/domain-templates/[id] - Delete domain template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if domain template exists
    const domainTemplate = await prisma.domainTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assessmentTemplates: true },
        },
      },
    });

    if (!domainTemplate) {
      return NextResponse.json(
        { error: "Domain template not found" },
        { status: 404 }
      );
    }

    // Check if domain template is being used
    if (domainTemplate._count.assessmentTemplates > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete domain template that is being used by assessment templates",
        },
        { status: 409 }
      );
    }

    // Delete the domain template
    await prisma.domainTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Domain template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting domain template:", error);
    return NextResponse.json(
      { error: "Failed to delete domain template" },
      { status: 500 }
    );
  }
}
