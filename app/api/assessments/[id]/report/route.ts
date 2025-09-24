/**
 * PDF Report Generation API
 *
 * Generates downloadable PDF reports for completed assessments
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import {
  PDFReportGenerator,
  generateAIRecommendations,
  type ReportOptions,
} from "@/lib/reports/pdf-generator";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = (await params).id;
    const body = await request.json();

    // Resolve shortId to UUID if needed
    const assessmentId = await resolveAssessmentId(identifier, session.user.id);
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Default report options
    const reportOptions: ReportOptions = {
      includeCharts: true,
      includeRecommendations: true,
      includeDetailedResponses: false,
      includeTrends: false,
      organizationName: "AI Diagnostic System",
      reportTitle: "Behavioral Assessment Report",
      ...body.options,
    };

    // Fetch assessment with complete data
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
        userId: session.user.id, // Ensure user owns the assessment
      },
      include: {
        scores: {
          orderBy: { timestamp: "asc" },
        },
        messages: {
          orderBy: { timestamp: "asc" },
          take: 50, // Limit for performance
        },
        responses: {
          orderBy: { timestamp: "asc" },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment must be completed to generate report" },
        { status: 400 }
      );
    }

    // Generate AI recommendations if requested
    let aiRecommendations = "";
    if (reportOptions.includeRecommendations) {
      aiRecommendations = await generateAIRecommendations(assessment);
    }

    // Create report data
    const reportData = {
      assessment,
      aiRecommendations,
      generatedAt: new Date(),
    };

    // Generate PDF
    const generator = new PDFReportGenerator();
    const pdfBlob = await generator.generateReport(reportData, reportOptions);

    // Convert blob to buffer for response
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Set response headers for PDF download
    const filename = `assessment-report-${assessment.subjectName.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF report" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const assessmentId = url.searchParams.get("assessmentId");

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Check if assessment exists and is completed
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        id: true,
        status: true,
        subjectName: true,
        completedAt: true,
        _count: {
          select: {
            scores: true,
            responses: true,
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

    return NextResponse.json({
      available: assessment.status === "COMPLETED",
      assessment: {
        id: assessment.id,
        subjectName: assessment.subjectName,
        completedAt: assessment.completedAt,
        scoreCount: assessment._count.scores,
        responseCount: assessment._count.responses,
      },
    });
  } catch (error) {
    console.error("Error checking report availability:", error);
    return NextResponse.json(
      { error: "Failed to check report availability" },
      { status: 500 }
    );
  }
}
