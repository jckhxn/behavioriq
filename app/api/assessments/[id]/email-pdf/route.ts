import { NextRequest, NextResponse } from "next/server";
import { sendAssessmentPDFEmail } from "@/lib/email/send-pdf";
import prisma from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUserWithRole();

    if (!currentUser?.id || !currentUser.email) {
      return NextResponse.json(
        { error: "Unauthorized - email required" },
        { status: 401 }
      );
    }

    // Verify assessment exists and belongs to user
    const { id } = await params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "You do not have permission to access this assessment" },
        { status: 403 }
      );
    }

    if (assessment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment must be completed before sending report" },
        { status: 400 }
      );
    }

    // Send the email with PDF attachment
    const result = await sendAssessmentPDFEmail({
      to: currentUser.email,
      assessmentId: id,
      userName:
        currentUser.name ||
        assessment.user?.name ||
        assessment.user?.email ||
        "User",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error sending PDF email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    );
  }
}
