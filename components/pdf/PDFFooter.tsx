import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFDocument';

export interface PDFFooterProps {
  companyName?: string;
  confidentialityNotice?: boolean;
  assessmentId?: string;
}

export const PDFFooter: React.FC<PDFFooterProps> = ({
  companyName = 'AI Diagnostic',
  confidentialityNotice = true,
  assessmentId,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <View style={pdfStyles.footer}>
      <Text>
        © {currentYear} {companyName}. All rights reserved.
      </Text>

      {confidentialityNotice && (
        <Text style={{ marginTop: 8, fontSize: 8, color: '#a0aec0' }}>
          This document is confidential and contains proprietary information. Unauthorized
          distribution or reproduction is prohibited.
        </Text>
      )}

      {assessmentId && (
        <Text style={{ marginTop: 8, fontSize: 8, color: '#cbd5e0' }}>
          Assessment ID: {assessmentId}
        </Text>
      )}

      <Text style={{ marginTop: 12, fontSize: 9, color: '#718096' }}>
        Generated on {new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};
