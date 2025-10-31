import { prisma } from "@/lib/db/prisma";
import { RiskLevel, AssessmentStatus } from "@prisma/client";
import {
  PDFReportGenerator,
  generateAIRecommendations,
  ReportOptions,
} from "@/lib/reports/pdf-generator";
import * as fs from "fs/promises";
import * as path from "path";

export interface AIReportData {
  id: string;
  assessmentId: string;
  content: string;
  summary?: string;
  riskLevel: RiskLevel;
  generatedAt: Date;
  generatedByUserId: string;
  reportOptions: ReportOptions;
  pdfPath?: string;
  pdfSize?: number;
  emailsSent: number;
  lastAccessedAt?: Date;
  isArchived: boolean;
}

export interface CreateAIReportOptions {
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  includeDetailedResponses?: boolean;
  includeTrends?: boolean;
  generatePDF?: boolean;
  organizationName?: string;
  reportTitle?: string;
}

export class AIReportService {
  private static readonly REPORTS_DIR =
    process.env.REPORTS_STORAGE_DIR || "./storage/reports";

  /**
   * Check if an AI report already exists for an assessment
   */
  static async hasExistingReport(assessmentId: string): Promise<boolean> {
    const report = await prisma.aIReport.findUnique({
      where: { assessmentId },
    });
    return !!report;
  }

  /**
   * Get existing AI report for an assessment
   */
  static async getExistingReport(
    assessmentId: string
  ): Promise<AIReportData | null> {
    const report = await prisma.aIReport.findUnique({
      where: { assessmentId },
    });

    if (!report) return null;

    // Update last accessed time
    await prisma.aIReport.update({
      where: { id: report.id },
      data: { lastAccessedAt: new Date() },
    });

    return {
      id: report.id,
      assessmentId: report.assessmentId,
      content: report.content,
      summary: report.summary || undefined,
      riskLevel: report.riskLevel,
      generatedAt: report.generatedAt,
      generatedByUserId: report.generatedByUserId,
      reportOptions: report.reportOptions as unknown as ReportOptions,
      pdfPath: report.pdfPath || undefined,
      pdfSize: report.pdfSize || undefined,
      emailsSent: report.emailsSent,
      lastAccessedAt: report.lastAccessedAt || undefined,
      isArchived: report.isArchived,
    };
  }

  /**
   * Generate and store a new AI report for an assessment
   */
  static async generateReport(
    assessmentId: string,
    userId: string,
    options: CreateAIReportOptions = {}
  ): Promise<AIReportData> {
    // Check if report already exists
    const existingReport = await this.hasExistingReport(assessmentId);
    if (existingReport) {
      throw new Error(
        "AI Report has already been generated for this assessment. Use getExistingReport() to retrieve it."
      );
    }

    // Get assessment data
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        scores: true,
        messages: true,
        responses: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    if (assessment.status !== AssessmentStatus.COMPLETED) {
      throw new Error(
        "Assessment must be completed before generating AI report"
      );
    }

    // Generate AI recommendations
    const aiRecommendations = await generateAIRecommendations(assessment as any);

    // Calculate overall risk level
    const overallRisk = this.calculateOverallRisk(assessment.scores);

    // Generate executive summary
    const summary = this.generateExecutiveSummary(assessment, overallRisk);

    // Prepare report options
    const reportOptions: ReportOptions = {
      includeCharts: options.includeCharts ?? true,
      includeRecommendations: options.includeRecommendations ?? true,
      includeDetailedResponses: options.includeDetailedResponses ?? false,
      includeTrends: options.includeTrends ?? false,
      organizationName: options.organizationName || "AI Diagnostic System",
      reportTitle: options.reportTitle || "Behavioral Assessment Report",
    };

    // Generate PDF if requested
    let pdfPath: string | undefined;
    let pdfSize: number | undefined;

    if (options.generatePDF) {
      try {
        const reportData = {
          assessment,
          aiRecommendations,
          generatedAt: new Date(),
        };

        const generator = new PDFReportGenerator();
        const pdfBlob = await generator.generateReport(
          reportData as any,
          reportOptions
        );

        // Store PDF to filesystem
        const pdfResult = await this.storePDF(assessmentId, pdfBlob);
        pdfPath = pdfResult.path;
        pdfSize = pdfResult.size;
      } catch (error) {
        console.error("Failed to generate PDF:", error);
        // Continue without PDF if generation fails
      }
    }

    // Store AI report in database
    const report = await prisma.aIReport.create({
      data: {
        assessmentId,
        content: aiRecommendations,
        summary,
        riskLevel: overallRisk,
        generatedByUserId: userId,
        reportOptions: reportOptions as any,
        pdfPath,
        pdfSize,
      },
    });

    return {
      id: report.id,
      assessmentId: report.assessmentId,
      content: report.content,
      summary: report.summary || undefined,
      riskLevel: report.riskLevel,
      generatedAt: report.generatedAt,
      generatedByUserId: report.generatedByUserId,
      reportOptions: report.reportOptions as unknown as ReportOptions,
      pdfPath: report.pdfPath || undefined,
      pdfSize: report.pdfSize || undefined,
      emailsSent: report.emailsSent,
      lastAccessedAt: report.lastAccessedAt || undefined,
      isArchived: report.isArchived,
    };
  }

  /**
   * Get or generate AI report (convenience method)
   */
  static async getOrGenerateReport(
    assessmentId: string,
    userId: string,
    options: CreateAIReportOptions = {}
  ): Promise<AIReportData> {
    const existingReport = await this.getExistingReport(assessmentId);
    if (existingReport) {
      return existingReport;
    }

    return this.generateReport(assessmentId, userId, options);
  }

  /**
   * Get PDF buffer for a report
   */
  static async getReportPDF(reportId: string): Promise<Buffer | null> {
    const report = await prisma.aIReport.findUnique({
      where: { id: reportId },
      select: { pdfPath: true },
    });

    if (!report?.pdfPath) {
      return null;
    }

    try {
      const pdfBuffer = await fs.readFile(report.pdfPath);
      return pdfBuffer;
    } catch (error) {
      console.error("Failed to read PDF file:", error);
      return null;
    }
  }

  /**
   * Regenerate PDF for existing report
   */
  static async regeneratePDF(reportId: string): Promise<string | null> {
    const report = await prisma.aIReport.findUnique({
      where: { id: reportId },
      include: {
        assessment: {
          include: {
            scores: true,
            messages: true,
            responses: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    try {
      const reportData = {
        assessment: report.assessment,
        aiRecommendations: report.content,
        generatedAt: report.generatedAt,
      };

      const generator = new PDFReportGenerator();
      const pdfBlob = await generator.generateReport(
        reportData as any,
        report.reportOptions as unknown as ReportOptions
      );

      // Remove old PDF if exists
      if (report.pdfPath) {
        try {
          await fs.unlink(report.pdfPath);
        } catch (error) {
          console.log("Old PDF file not found or already deleted");
        }
      }

      // Store new PDF
      const pdfResult = await this.storePDF(report.assessmentId, pdfBlob);

      // Update database
      await prisma.aIReport.update({
        where: { id: reportId },
        data: {
          pdfPath: pdfResult.path,
          pdfSize: pdfResult.size,
        },
      });

      return pdfResult.path;
    } catch (error) {
      console.error("Failed to regenerate PDF:", error);
      throw new Error("Failed to regenerate PDF");
    }
  }

  /**
   * Track email sent for a report
   */
  static async trackEmailSent(reportId: string): Promise<void> {
    await prisma.aIReport.update({
      where: { id: reportId },
      data: {
        emailsSent: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Archive a report
   */
  static async archiveReport(reportId: string): Promise<void> {
    await prisma.aIReport.update({
      where: { id: reportId },
      data: { isArchived: true },
    });
  }

  /**
   * Get reports summary for an assessment
   */
  static async getReportsSummary(userId: string): Promise<{
    totalReports: number;
    recentReports: number;
    totalEmailsSent: number;
  }> {
    const [totalReports, recentReports, emailStats] = await Promise.all([
      prisma.aIReport.count({
        where: { generatedByUserId: userId },
      }),
      prisma.aIReport.count({
        where: {
          generatedByUserId: userId,
          generatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.aIReport.aggregate({
        where: { generatedByUserId: userId },
        _sum: { emailsSent: true },
      }),
    ]);

    return {
      totalReports,
      recentReports,
      totalEmailsSent: emailStats._sum.emailsSent || 0,
    };
  }

  /**
   * Store PDF blob to filesystem
   */
  private static async storePDF(
    assessmentId: string,
    pdfBlob: Blob
  ): Promise<{ path: string; size: number }> {
    // Ensure reports directory exists
    await fs.mkdir(this.REPORTS_DIR, { recursive: true });

    const filename = `report-${assessmentId}-${Date.now()}.pdf`;
    const filePath = path.join(this.REPORTS_DIR, filename);

    const buffer = Buffer.from(await pdfBlob.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return {
      path: filePath,
      size: buffer.length,
    };
  }

  /**
   * Calculate overall risk level from assessment scores
   */
  private static calculateOverallRisk(scores: any[]): RiskLevel {
    if (!scores.length) return RiskLevel.LOW;

    const riskValues = {
      [RiskLevel.LOW]: 1,
      [RiskLevel.MODERATE]: 2,
      [RiskLevel.HIGH]: 3,
      [RiskLevel.VERY_HIGH]: 4,
    };

    const totalRisk = scores.reduce(
      (sum, score) => sum + riskValues[score.riskLevel as RiskLevel],
      0
    );
    const averageRisk = totalRisk / scores.length;

    if (averageRisk >= 3.5) return RiskLevel.VERY_HIGH;
    if (averageRisk >= 2.5) return RiskLevel.HIGH;
    if (averageRisk >= 1.5) return RiskLevel.MODERATE;
    return RiskLevel.LOW;
  }

  /**
   * Generate executive summary
   */
  private static generateExecutiveSummary(
    assessment: any,
    riskLevel: RiskLevel
  ): string {
    const totalScores = assessment.scores.length;
    const averageScore =
      assessment.scores.reduce(
        (sum: number, score: any) => sum + score.rawScore,
        0
      ) / totalScores;

    return `Based on the comprehensive behavioral assessment of ${assessment.subjectName}, conducted on ${assessment.completedAt?.toDateString()}, the overall risk level has been determined as ${riskLevel}. The assessment evaluated ${totalScores} behavioral domains with an average score of ${averageScore.toFixed(1)}. This analysis provides insights into behavioral patterns and associated risk factors, with detailed recommendations provided in the full report.`;
  }
}
