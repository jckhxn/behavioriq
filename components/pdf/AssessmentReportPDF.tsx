import React from 'react';
import { View } from '@react-pdf/renderer';
import { PDFDocumentComponent, pdfStyles } from './PDFDocument';
import { PDFHeader } from './PDFHeader';
import { PDFExecutiveSummary } from './PDFExecutiveSummary';
import { PDFRiskAssessment } from './PDFRiskAssessment';
import { PDFRecommendations } from './PDFRecommendations';
import { PDFFooter } from './PDFFooter';
import type { Assessment, Score } from '@prisma/client';

export interface AssessmentReportPDFProps {
  assessment: Assessment & {
    scores: Score[];
    user: {
      name: string | null;
      email: string;
    } | null;
    assessmentTemplate?: {
      name: string;
    } | null;
  };
  aiRecommendations?: string;
  reportTitle?: string;
  organizationName?: string;
  options?: {
    includeCharts?: boolean;
    includeRecommendations?: boolean;
    includeDetailedResponses?: boolean;
    includeTrends?: boolean;
  };
}

export const AssessmentReportPDF: React.FC<AssessmentReportPDFProps> = ({
  assessment,
  aiRecommendations = 'No recommendations available',
  reportTitle = 'Behavioral Assessment Report',
  organizationName,
  options = {
    includeCharts: true,
    includeRecommendations: true,
    includeDetailedResponses: false,
    includeTrends: false,
  },
}) => {
  const assessmentType = assessment.assessmentTemplate?.name || assessment.subjectName || 'Behavioral Assessment';
  const userName = assessment.user?.name || assessment.subjectName || 'Anonymous';

  return (
    <PDFDocumentComponent>
      {/* Header */}
      <PDFHeader
        title={reportTitle}
        subject={assessmentType}
        assessmentDate={assessment.startedAt}
        userName={userName}
        organizationName={organizationName}
      />

      {/* Executive Summary */}
      <PDFExecutiveSummary assessment={assessment} />

      {/* Risk Assessment Table */}
      <PDFRiskAssessment assessment={assessment} />

      {/* AI Recommendations */}
      {options.includeRecommendations && aiRecommendations && (
        <PDFRecommendations recommendations={aiRecommendations} />
      )}

      {/* Footer */}
      <View style={{ marginTop: 40 }}>
        <PDFFooter
          companyName={organizationName || 'AI Diagnostic'}
          confidentialityNotice={true}
          assessmentId={assessment.id}
        />
      </View>
    </PDFDocumentComponent>
  );
};
