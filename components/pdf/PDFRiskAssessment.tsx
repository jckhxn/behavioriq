import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFDocument';
import type { Assessment, Score } from '@prisma/client';

export interface PDFRiskAssessmentProps {
  assessment: Assessment & { scores: Score[] };
}

export const PDFRiskAssessment: React.FC<PDFRiskAssessmentProps> = ({ assessment }) => {
  const getRiskLevel = (score: number): string => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    return 'High Risk';
  };

  const getRiskStyle = (score: number): any => {
    if (score >= 80) return pdfStyles.riskLow;
    if (score >= 60) return pdfStyles.riskMedium;
    return pdfStyles.riskHigh;
  };

  // Sort scores by rawScore value (descending)
  const sortedScores = [...assessment.scores].sort((a, b) => (b.rawScore || 0) - (a.rawScore || 0));

  return (
    <View style={pdfStyles.sectionContent}>
      <Text style={pdfStyles.sectionTitle}>Domain Risk Assessment</Text>

      <View style={pdfStyles.table}>
        {/* Table Header */}
        <View style={pdfStyles.tableRow}>
          <View style={pdfStyles.tableHeader}>
            <Text>Domain</Text>
          </View>
          <View style={pdfStyles.tableHeader}>
            <Text>Score</Text>
          </View>
          <View style={[pdfStyles.tableHeader, { borderRightWidth: 0 }]}>
            <Text>Risk Level</Text>
          </View>
        </View>

        {/* Table Body */}
        {sortedScores.map((score, index) => (
          <View key={index} style={pdfStyles.tableRow}>
            <View style={pdfStyles.tableCell}>
              <Text>{score.domainName || 'Unknown'}</Text>
            </View>
            <View style={pdfStyles.tableCell}>
              <Text>{Math.round(score.rawScore || 0)}%</Text>
            </View>
            <View style={[pdfStyles.tableCellLast, { alignItems: 'flex-end' }]}>
              <Text style={getRiskStyle(score.rawScore || 0)}>
                {getRiskLevel(score.rawScore || 0)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Risk Summary */}
      <View style={{ marginTop: 12, padding: 8, backgroundColor: '#fef3c7' }}>
        <Text style={{ fontSize: 10, color: '#78350f', fontWeight: 'bold' }}>
          ⚠️ Note:
        </Text>
        <Text style={{ fontSize: 9, color: '#92400e', marginTop: 4 }}>
          Scores are evaluated on a 0-100 scale. Higher scores indicate lower risk. Areas with scores
          below 60 indicate potential areas for improvement and should be prioritized for development.
        </Text>
      </View>
    </View>
  );
};
