/**
 * AI Report Generation API
 *
 * Generates and manages AI-powered assessment reports with caching
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { AIReportService } from "@/lib/reports/ai-report-service";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";
import {
  areAIReportsEnabled,
  getMaxAIReportsPerUser,
} from "@/lib/platform/settings";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if AI reports are enabled globally
    const aiReportsEnabled = await areAIReportsEnabled();
    if (!aiReportsEnabled) {
      return NextResponse.json(
        {
          error:
            "AI report generation is currently disabled by the administrator",
        },
        { status: 403 }
      );
    }

    // Check user's AI report count against the global limit
    const maxReports = await getMaxAIReportsPerUser();
    const userReportCount = await prisma.aIReport.count({
      where: { generatedByUserId: user.id },
    });

    if (userReportCount >= maxReports) {
      return NextResponse.json(
        {
          error: `You have reached the maximum limit of ${maxReports} AI reports. Please contact support if you need additional reports.`,
          currentCount: userReportCount,
          maxAllowed: maxReports,
        },
        { status: 403 }
      );
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

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        isConversational: true,
        userId: true,
        mode: true,
        aiReportGenerated: true,
      },
    });

    if (!assessment || assessment.userId !== user.id) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Gate AI report generation on FULL mode (requires paid upgrade)
    if (assessment.mode === "TRIAL") {
      return NextResponse.json(
        {
          error:
            "AI reports are only available for full assessments. Please complete the trial and upgrade to generate a full report.",
        },
        { status: 403 }
      );
    }

    // Gate AI report generation on aiReportGenerated flag (prevent re-runs to control costs)
    if (assessment.aiReportGenerated) {
      return NextResponse.json(
        {
          error:
            "AI report has already been generated for this assessment. AI reports are generated once per assessment to control costs.",
          hasExisting: true,
        },
        { status: 403 }
      );
    }

    let userLicense: {
      id: string;
      conversationalReportsAllowed: number;
      conversationalReportsUsed: number;
      license: { maxConversationalReports: number | null };
    } | null = null;

    if (assessment.isConversational) {
      userLicense = await prisma.userLicense.findFirst({
        where: {
          userId: user.id,
          isActive: true,
        },
        select: {
          id: true,
          conversationalReportsAllowed: true,
          conversationalReportsUsed: true,
          license: {
            select: {
              maxConversationalReports: true,
            },
          },
        },
        orderBy: {
          assignedAt: "desc",
        },
      });

      if (!userLicense) {
        return NextResponse.json(
          {
            error:
              "No active license found for conversational reports. Please contact support.",
          },
          { status: 403 }
        );
      }

      const explicitAllowance = userLicense.conversationalReportsAllowed ?? 0;
      const licenseAllowance = userLicense.license.maxConversationalReports;
      let reportCap: number | null;
      if (explicitAllowance > 0) {
        reportCap = explicitAllowance;
      } else if (licenseAllowance === null) {
        reportCap = null;
      } else {
        reportCap = licenseAllowance ?? explicitAllowance;
      }
      const reportsUsed = userLicense.conversationalReportsUsed ?? 0;

      if (reportCap !== null && reportsUsed >= reportCap) {
        return NextResponse.json(
          {
            error:
              "You have reached the maximum number of conversational AI reports allowed by your license.",
            currentCount: reportsUsed,
            maxAllowed: reportCap,
          },
          { status: 403 }
        );
      }
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

    // Set aiReportGenerated flag to true (prevent re-runs)
    try {
      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          aiReportGenerated: true,
        },
      });
    } catch (flagError) {
      console.error(
        "[AIReport] Failed to set aiReportGenerated flag:",
        flagError
      );
      // Don't fail the response, just log the error
    }

    const response = NextResponse.json({
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

    if (assessment.isConversational && userLicense) {
      try {
        await prisma.userLicense.update({
          where: { id: userLicense.id },
          data: {
            conversationalReportsUsed: {
              increment: 1,
            },
          },
        });
      } catch (incrementError) {
        console.error(
          "[AIReport] Failed to increment conversational reports:",
          incrementError
        );
      }
    }

    return response;
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
