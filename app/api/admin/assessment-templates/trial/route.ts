import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

// PUT /api/admin/assessment-templates/trial - Update trial question configuration
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assessmentId, domainId, questions } = await request.json();

    if (!assessmentId || !domainId || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Assessment ID, domain ID, and questions array are required" },
        { status: 400 }
      );
    }

    // Verify the assessment exists and get the domain template
    const assessment = await prisma.assessmentTemplate.findUnique({
      where: { id: assessmentId },
      include: {
        domains: {
          include: {
            domainTemplate: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment template not found" },
        { status: 404 }
      );
    }

    // Find the domain in the assessment
    const assessmentDomain = assessment.domains.find(
      (d) => d.domainTemplate.id === domainId
    );

    if (!assessmentDomain) {
      return NextResponse.json(
        { error: "Domain not found in this assessment" },
        { status: 404 }
      );
    }

    // Update the domain template with new trial configuration
    // The domain template stores questions as JSON, so we update the questions array
    // with the new isTrial flags
    const updatedQuestions = questions.map((question: any) => ({
      ...question,
      isTrial: question.isTrial === true,
    }));

    await prisma.domainTemplate.update({
      where: { id: domainId },
      data: {
        questions: updatedQuestions,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trial configuration updated successfully",
      updatedCount: questions.length,
    });
  } catch (error) {
    console.error("Error updating trial configuration:", error);
    return NextResponse.json(
      { error: "Failed to update trial configuration" },
      { status: 500 }
    );
  }
}
