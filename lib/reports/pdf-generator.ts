/**
 * PDF Report Generator
 *
 * Generates comprehensive assessment reports with charts and AI recommendations
 */

import jsPDF from "jspdf";
import { Assessment, Score, RiskLevel, AssessmentDomain } from "@prisma/client";
import { ChartGenerator } from "./chart-generator";

export interface AssessmentReport {
  assessment: Assessment & {
    scores: Score[];
    messages: any[];
    responses: any[];
    user: {
      name: string | null;
      email: string;
    };
  };
  aiRecommendations: string;
  generatedAt: Date;
}

export interface ReportOptions {
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeDetailedResponses: boolean;
  includeTrends: boolean;
  logoUrl?: string;
  organizationName?: string;
  reportTitle?: string;
}

export class PDFReportGenerator {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private pageWidth: number = 210; // A4 width in mm
  private margin: number = 20;

  constructor() {
    this.pdf = new jsPDF("p", "mm", "a4");
  }

  async generateReport(
    report: AssessmentReport,
    options: ReportOptions
  ): Promise<Blob> {
    // Reset position
    this.currentY = 20;

    // Generate report sections
    await this.addHeader(report, options);
    await this.addExecutiveSummary(report);
    await this.addRiskAssessment(report);

    if (options.includeCharts) {
      await this.addChartsSection(report);
    }

    if (options.includeRecommendations) {
      await this.addRecommendations(report);
    }

    if (options.includeDetailedResponses) {
      await this.addDetailedResponses(report);
    }

    await this.addFooter(report, options);

    // Return as blob
    return new Blob([this.pdf.output()], { type: "application/pdf" });
  }

  private async addHeader(report: AssessmentReport, options: ReportOptions) {
    const { assessment } = report;

    // Title
    this.pdf.setFontSize(24);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(
      options.reportTitle || "Behavioral Assessment Report",
      this.margin,
      this.currentY
    );
    this.currentY += 15;

    // Organization name
    if (options.organizationName) {
      this.pdf.setFontSize(12);
      this.pdf.setFont("helvetica", "normal");
      this.pdf.text(options.organizationName, this.margin, this.currentY);
      this.currentY += 8;
    }

    // Subject information
    this.pdf.setFontSize(14);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text("Assessment Details", this.margin, this.currentY);
    this.currentY += 10;

    this.pdf.setFontSize(11);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.text(
      `Subject: ${assessment.subjectName}`,
      this.margin,
      this.currentY
    );
    this.currentY += 6;
    this.pdf.text(
      `Assessment ID: ${assessment.id}`,
      this.margin,
      this.currentY
    );
    this.currentY += 6;
    this.pdf.text(
      `Completed: ${new Date(assessment.completedAt || assessment.startedAt).toLocaleDateString()}`,
      this.margin,
      this.currentY
    );
    this.currentY += 6;
    this.pdf.text(
      `Generated: ${report.generatedAt.toLocaleDateString()}`,
      this.margin,
      this.currentY
    );
    this.currentY += 15;

    // Add line separator
    this.pdf.setLineWidth(0.5);
    this.pdf.line(
      this.margin,
      this.currentY,
      this.pageWidth - this.margin,
      this.currentY
    );
    this.currentY += 10;
  }

  private async addExecutiveSummary(report: AssessmentReport) {
    const { assessment } = report;

    this.addSectionTitle("Executive Summary");

    // Overall risk assessment
    const overallRisk = this.calculateOverallRisk(assessment.scores);
    const riskColor = this.getRiskColor(overallRisk);

    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setTextColor(...riskColor);
    this.pdf.text(
      `Overall Risk Level: ${overallRisk}`,
      this.margin,
      this.currentY
    );
    this.pdf.setTextColor(0, 0, 0); // Reset to black
    this.currentY += 10;

    // Summary statistics
    this.pdf.setFontSize(11);
    this.pdf.setFont("helvetica", "normal");

    const completedDomains = assessment.scores.length;
    const totalQuestions = assessment.responses?.length || 0;
    const averageScore =
      assessment.scores.reduce((sum, score) => sum + score.rawScore, 0) /
      completedDomains;

    this.pdf.text(
      `Domains Assessed: ${completedDomains}`,
      this.margin,
      this.currentY
    );
    this.currentY += 6;
    this.pdf.text(
      `Total Questions Answered: ${totalQuestions}`,
      this.margin,
      this.currentY
    );
    this.currentY += 6;
    this.pdf.text(
      `Average Domain Score: ${averageScore.toFixed(1)}`,
      this.margin,
      this.currentY
    );
    this.currentY += 15;
  }

  private async addRiskAssessment(report: AssessmentReport) {
    const { assessment } = report;

    this.addSectionTitle("Risk Assessment by Domain");

    // Create a table-like layout for scores
    const tableY = this.currentY;
    const colWidths = [60, 30, 30, 50];
    const rowHeight = 8;

    // Table headers
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(10);
    this.pdf.text("Domain", this.margin, tableY);
    this.pdf.text("Score", this.margin + colWidths[0], tableY);
    this.pdf.text("Risk", this.margin + colWidths[0] + colWidths[1], tableY);
    this.pdf.text(
      "Confidence",
      this.margin + colWidths[0] + colWidths[1] + colWidths[2],
      tableY
    );

    this.currentY = tableY + rowHeight;

    // Table rows
    this.pdf.setFont("helvetica", "normal");
    assessment.scores.forEach((score, index) => {
      const y = this.currentY + index * rowHeight;

      this.pdf.text(
        this.formatDomainName(score.domain),
        this.margin,
        y
      );
      this.pdf.text(
        `${score.rawScore}/${score.totalPossible}`,
        this.margin + colWidths[0],
        y
      );

      // Risk level with color
      const riskColor = this.getRiskColor(score.riskLevel);
      this.pdf.setTextColor(...riskColor);
      this.pdf.text(
        score.riskLevel,
        this.margin + colWidths[0] + colWidths[1],
        y
      );
      this.pdf.setTextColor(0, 0, 0);

      this.pdf.text(
        `${(score.confidence * 100).toFixed(0)}%`,
        this.margin + colWidths[0] + colWidths[1] + colWidths[2],
        y
      );
    });

    this.currentY += assessment.scores.length * rowHeight + 15;
  }

  private async addChartsSection(report: AssessmentReport) {
    this.checkPageBreak(120); // Ensure space for chart

    this.addSectionTitle("Assessment Results Chart");

    try {
      // Generate line chart
      const chartDataURL = ChartGenerator.generateLineChartDataURL(
        report.assessment.scores,
        160, // Width in mm for PDF
        80 // Height in mm for PDF
      );

      // Add chart to PDF
      this.pdf.addImage(
        chartDataURL,
        "PNG",
        this.margin,
        this.currentY,
        160, // Width
        80 // Height
      );

      this.currentY += 90; // Chart height + spacing
    } catch (error) {
      console.error("Error generating chart for PDF:", error);

      // Fallback to text-based chart
      this.pdf.setFontSize(11);
      this.pdf.setFont("helvetica", "normal");

      this.pdf.text("Score Summary:", this.margin, this.currentY);
      this.currentY += 8;

      report.assessment.scores.forEach((score) => {
        const barLength = Math.floor(
          (score.rawScore / score.totalPossible) * 40
        );
        const bar = "█".repeat(barLength) + "░".repeat(40 - barLength);

        this.pdf.setFontSize(9);
        this.pdf.text(
          `${this.formatDomainName(score.domain)}: ${bar} ${score.rawScore}/${score.totalPossible}`,
          this.margin,
          this.currentY
        );
        this.currentY += 6;
      });

      this.currentY += 10;
    }
  }

  private async addRecommendations(report: AssessmentReport) {
    this.checkPageBreak(80);

    this.addSectionTitle("AI-Generated Recommendations");

    // Split recommendations into paragraphs
    const recommendations = report.aiRecommendations
      .split("\n")
      .filter((line) => line.trim());

    this.pdf.setFontSize(11);
    this.pdf.setFont("helvetica", "normal");

    recommendations.forEach((recommendation) => {
      const lines = this.pdf.splitTextToSize(
        recommendation.trim(),
        this.pageWidth - this.margin * 2
      );
      lines.forEach((line: string) => {
        this.checkPageBreak(6);
        this.pdf.text(line, this.margin, this.currentY);
        this.currentY += 6;
      });
      this.currentY += 3; // Extra space between paragraphs
    });

    this.currentY += 10;
  }

  private async addDetailedResponses(report: AssessmentReport) {
    this.checkPageBreak(50);

    this.addSectionTitle("Detailed Response Analysis");

    this.pdf.setFontSize(11);
    this.pdf.setFont("helvetica", "normal");

    if (report.assessment.responses && report.assessment.responses.length > 0) {
      this.pdf.text(
        `Total responses recorded: ${report.assessment.responses.length}`,
        this.margin,
        this.currentY
      );
      this.currentY += 8;

      // Group responses by answer
      const yesResponses = report.assessment.responses.filter(
        (r: any) => r.response === true
      ).length;
      const noResponses = report.assessment.responses.filter(
        (r: any) => r.response === false
      ).length;

      this.pdf.text(
        `"Yes" responses: ${yesResponses}`,
        this.margin,
        this.currentY
      );
      this.currentY += 6;
      this.pdf.text(
        `"No" responses: ${noResponses}`,
        this.margin,
        this.currentY
      );
      this.currentY += 6;

      const yesPercentage = (
        (yesResponses / report.assessment.responses.length) *
        100
      ).toFixed(1);
      this.pdf.text(
        `Positive response rate: ${yesPercentage}%`,
        this.margin,
        this.currentY
      );
      this.currentY += 15;
    } else {
      this.pdf.text(
        "No detailed responses available.",
        this.margin,
        this.currentY
      );
      this.currentY += 15;
    }
  }

  private async addFooter(report: AssessmentReport, options: ReportOptions) {
    // Add disclaimer
    this.pdf.setPage(this.pdf.getNumberOfPages());
    const disclaimerY = this.pageHeight - 30;

    this.pdf.setFontSize(8);
    this.pdf.setFont("helvetica", "italic");
    this.pdf.setTextColor(100, 100, 100);

    const disclaimer =
      "This report is generated by AI and should be used for informational purposes only. Professional clinical judgment should always be applied when interpreting these results.";
    const disclaimerLines = this.pdf.splitTextToSize(
      disclaimer,
      this.pageWidth - this.margin * 2
    );

    disclaimerLines.forEach((line: string, index: number) => {
      this.pdf.text(line, this.margin, disclaimerY + index * 4);
    });

    // Add page numbers
    const pageCount = this.pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: "right" }
      );
    }
  }

  private addSectionTitle(title: string) {
    this.checkPageBreak(20);

    this.pdf.setFontSize(16);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 12;
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.pdf.addPage();
      this.currentY = 20;
    }
  }

  private calculateOverallRisk(scores: Score[]): RiskLevel {
    if (scores.length === 0) return "LOW";

    const riskValues = { LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 };
    const averageRisk =
      scores.reduce((sum, score) => sum + riskValues[score.riskLevel], 0) /
      scores.length;

    if (averageRisk >= 3.5) return "VERY_HIGH";
    if (averageRisk >= 2.5) return "HIGH";
    if (averageRisk >= 1.5) return "MODERATE";
    return "LOW";
  }

  private getRiskColor(riskLevel: string): [number, number, number] {
    const colors = {
      LOW: [16, 185, 129] as [number, number, number],
      MODERATE: [245, 158, 11] as [number, number, number],
      HIGH: [239, 68, 68] as [number, number, number],
      VERY_HIGH: [220, 38, 38] as [number, number, number],
    };
    return colors[riskLevel as keyof typeof colors] || [107, 114, 128];
  }

  private formatDomainName(domain: string | null | undefined): string {
    if (!domain) {
      return "Unknown Domain";
    }
    return domain
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

// Utility function to generate AI recommendations
export async function generateAIRecommendations(
  assessment: AssessmentReport["assessment"]
): Promise<string> {
  try {
    const response = await fetch("/api/assessments/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId: assessment.id }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.recommendations;
    }
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
  }

  return "Recommendations could not be generated at this time. Please consult with a qualified professional for detailed analysis.";
}
