import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

// DELETE /api/admin/assessment-templates/[id] - Delete assessment template
export async function DELETE(
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

    // Check if assessment template exists
    const assessmentTemplate = await prisma.assessmentTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assessments: true },
        },
      },
    });

    if (!assessmentTemplate) {
      return NextResponse.json(
        { error: "Assessment template not found" },
        { status: 404 }
      );
    }

    // Check if assessment template is being used
    if (assessmentTemplate._count.assessments > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete assessment template that has been used for assessments",
        },
        { status: 409 }
      );
    }

    // Delete the assessment template (this will cascade delete the domain relationships)
    await prisma.assessmentTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Assessment template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assessment template:", error);
    return NextResponse.json(
      { error: "Failed to delete assessment template" },
      { status: 500 }
    );
  }
}
