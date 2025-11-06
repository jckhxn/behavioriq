/**
 * React PDF Report Generator
 *
 * Generates comprehensive assessment reports using react-pdf
 * Much simpler and more maintainable than jsPDF approach
 */

import React from 'react';
import { renderToStream, renderToBuffer } from '@react-pdf/renderer';
import { AssessmentReportPDF } from '@/components/pdf/AssessmentReportPDF';
import type { Assessment, Score } from '@prisma/client';

export interface AssessmentReport {
  assessment: Assessment & {
    scores: Score[];
    user: {
      name: string | null;
      email: string;
    };
  };
  aiRecommendations: string;
  generatedAt: Date;
}

export interface ReportOptions {
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  includeDetailedResponses?: boolean;
  includeTrends?: boolean;
  reportTitle?: string;
  organizationName?: string;
}

/**
 * Generate assessment report as Buffer (for file downloads)
 */
export async function generateAssessmentReportBuffer(
  report: AssessmentReport,
  options: ReportOptions = {}
): Promise<Buffer> {
  try {
    const pdf = React.createElement(AssessmentReportPDF as any, {
      assessment: report.assessment,
      aiRecommendations: report.aiRecommendations,
      reportTitle: options.reportTitle || 'Behavioral Assessment Report',
      organizationName: options.organizationName,
      options: {
        includeCharts: options.includeCharts ?? true,
        includeRecommendations: options.includeRecommendations ?? true,
        includeDetailedResponses: options.includeDetailedResponses ?? false,
        includeTrends: options.includeTrends ?? false,
      },
    });

    const buffer = await renderToBuffer(pdf as any);
    return buffer;
  } catch (error) {
    console.error('[ReactPDFGenerator] Error generating PDF buffer:', error);
    throw error;
  }
}

/**
 * Generate assessment report as Blob (for browser downloads)
 */
export async function generateAssessmentReportBlob(
  report: AssessmentReport,
  options: ReportOptions = {}
): Promise<Blob> {
  try {
    const buffer = await generateAssessmentReportBuffer(report, options);
    return new Blob([buffer as any], { type: 'application/pdf' });
  } catch (error) {
    console.error('[ReactPDFGenerator] Error generating PDF blob:', error);
    throw error;
  }
}

/**
 * Generate assessment report as Stream (for streaming to response)
 */
export async function generateAssessmentReportStream(
  report: AssessmentReport,
  options: ReportOptions = {}
) {
  try {
    const pdf = React.createElement(AssessmentReportPDF as any, {
      assessment: report.assessment,
      aiRecommendations: report.aiRecommendations,
      reportTitle: options.reportTitle || 'Behavioral Assessment Report',
      organizationName: options.organizationName,
      options: {
        includeCharts: options.includeCharts ?? true,
        includeRecommendations: options.includeRecommendations ?? true,
        includeDetailedResponses: options.includeDetailedResponses ?? false,
        includeTrends: options.includeTrends ?? false,
      },
    });

    return await renderToStream(pdf as any);
  } catch (error) {
    console.error('[ReactPDFGenerator] Error generating PDF stream:', error);
    throw error;
  }
}

/**
 * Generate assessment report file name
 */
export function generateReportFileName(
  assessment: Assessment,
  userName?: string
): string {
  const date = new Date(assessment.startedAt);
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const name = userName?.replace(/\s+/g, '-').toLowerCase() || assessment.subjectName?.replace(/\s+/g, '-').toLowerCase() || 'assessment';
  const assessmentType = assessment.subjectName?.replace(/\s+/g, '-').toLowerCase() || 'report';

  return `${name}-${assessmentType}-${dateStr}.pdf`;
}
