import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

// PATCH /api/admin/assessment-templates/[id] - Toggle isActive for a template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isActive } = await request.json();

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    const template = await prisma.assessmentTemplate.findUnique({ where: { id } });
    if (!template) {
      return NextResponse.json({ error: "Assessment template not found" }, { status: 404 });
    }

    const updated = await prisma.assessmentTemplate.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error toggling assessment template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

// DELETE /api/admin/assessment-templates/[id] - Delete assessment template
export async function DELETE(
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
