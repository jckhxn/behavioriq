import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFDocument';
import type { Assessment, Score } from '@prisma/client';

export interface PDFExecutiveSummaryProps {
  assessment: Assessment & { scores: Score[] };
}

export const PDFExecutiveSummary: React.FC<PDFExecutiveSummaryProps> = ({ assessment }) => {
  // Calculate overall score (average of all domain raw scores, then normalize to 0-100)
  const overallScore = assessment.scores.length > 0
    ? Math.round(assessment.scores.reduce((sum, s) => sum + (s.rawScore || 0), 0) / assessment.scores.length)
    : 0;

  // Determine overall risk level
  const getRiskLevel = (score: number): string => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    return 'High Risk';
  };

  const getRiskColor = (score: number): any => {
    if (score >= 80) return pdfStyles.riskLow;
    if (score >= 60) return pdfStyles.riskMedium;
    return pdfStyles.riskHigh;
  };

  const overallRiskLevel = getRiskLevel(overallScore);
  const riskStyle = getRiskColor(overallScore);

  return (
    <View style={pdfStyles.sectionContent}>
      <Text style={pdfStyles.sectionTitle}>Executive Summary</Text>

      <View style={[pdfStyles.sectionContent, { marginBottom: 0 }]}>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Overall Score:</Text>
          <Text style={pdfStyles.value}>{overallScore}%</Text>
        </View>

        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Risk Assessment:</Text>
          <Text style={[pdfStyles.value, riskStyle]}>{overallRiskLevel}</Text>
        </View>

        <View style={[pdfStyles.row, { marginTop: 12 }]}>
          <Text style={pdfStyles.label}>Assessment Status:</Text>
          <Text style={pdfStyles.value}>Completed</Text>
        </View>

        <View style={[pdfStyles.row, { marginTop: 12, marginBottom: 0 }]}>
          <Text style={pdfStyles.label}>Total Domains Assessed:</Text>
          <Text style={pdfStyles.value}>{assessment.scores.length}</Text>
        </View>
      </View>

      <View style={{ marginTop: 12, padding: 8, backgroundColor: '#f7fafc' }}>
        <Text style={{ fontSize: 10, color: '#4a5568', marginBottom: 4 }}>
          <Text style={{ fontWeight: 'bold' }}>Summary: </Text>
          This assessment provides a comprehensive behavioral analysis across multiple domains.
          The results indicate specific areas of strength and opportunity for development.
        </Text>
      </View>
    </View>
  );
};
