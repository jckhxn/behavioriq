import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { sendAssessmentPDFEmail } from "@/lib/email/send-pdf";
import prisma from "@/lib/db/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - email required" },
        { status: 401 }
      );
    }

    // Verify assessment exists and belongs to user
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
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

    if (assessment.userId !== session.user.id) {
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
      to: session.user.email,
      assessmentId: params.id,
      userName: session.user.name || "User",
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
