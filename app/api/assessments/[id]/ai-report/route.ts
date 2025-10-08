/**
 * AI Report Generation API
 *
 * Generates and manages AI-powered assessment reports with caching
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { AIReportService } from "@/lib/reports/ai-report-service";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = (await params).id;
    const body = await request.json();

    // Resolve shortId to UUID if needed
    const assessmentId = await resolveAssessmentId(identifier, user.id);
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check if AI report already exists
    const existingReport =
      await AIReportService.hasExistingReport(assessmentId);
    if (existingReport) {
      return NextResponse.json(
        {
          error:
            "AI Report has already been generated for this assessment. Use GET method to retrieve the existing report.",
          hasExisting: true,
        },
        { status: 409 } // Conflict status
      );
    }

    // Generate new AI report
    const reportOptions = {
      includeCharts: body.options?.includeCharts ?? true,
      includeRecommendations: body.options?.includeRecommendations ?? true,
      includeDetailedResponses: body.options?.includeDetailedResponses ?? false,
      includeTrends: body.options?.includeTrends ?? false,
      generatePDF: body.options?.generatePDF ?? true,
      organizationName:
        body.options?.organizationName || "AI Diagnostic System",
      reportTitle: body.options?.reportTitle || "Behavioral Assessment Report",
    };

    const report = await AIReportService.generateReport(
      assessmentId,
      user.id,
      reportOptions
    );

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        content: report.content,
        summary: report.summary,
        riskLevel: report.riskLevel,
        generatedAt: report.generatedAt,
        hasPDF: !!report.pdfPath,
      },
      message: "AI Report generated successfully",
    });
  } catch (error) {
    console.error("Error generating AI report:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate AI report",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = (await params).id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format"); // 'pdf' or 'json'

    // Resolve shortId to UUID if needed
    const assessmentId = await resolveAssessmentId(identifier, user.id);
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Get existing AI report
    const report = await AIReportService.getExistingReport(assessmentId);
    if (!report) {
      return NextResponse.json(
        {
          error:
            "No AI report exists for this assessment. Use POST method to generate one.",
          hasReport: false,
        },
        { status: 404 }
      );
    }

    // Return PDF if requested
    if (format === "pdf") {
      const pdfBuffer = await AIReportService.getReportPDF(report.id);
      if (!pdfBuffer) {
        return NextResponse.json(
          { error: "PDF not available for this report" },
          { status: 404 }
        );
      }

      const filename = `ai-report-${assessmentId}-${Date.now()}.pdf`;

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": pdfBuffer.length.toString(),
        },
      });
    }

    // Return JSON report data
    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        content: report.content,
        summary: report.summary,
        riskLevel: report.riskLevel,
        generatedAt: report.generatedAt,
        lastAccessedAt: report.lastAccessedAt,
        emailsSent: report.emailsSent,
        hasPDF: !!report.pdfPath,
        reportOptions: report.reportOptions,
      },
    });
  } catch (error) {
    console.error("Error retrieving AI report:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve AI report",
      },
      { status: 500 }
    );
  }
}
