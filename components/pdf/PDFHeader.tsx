import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFDocument';

export interface PDFHeaderProps {
  title: string;
  subject: string;
  assessmentDate: Date;
  userName: string;
  organizationName?: string;
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({
  title,
  subject,
  assessmentDate,
  userName,
  organizationName,
}) => {
  const formattedDate = new Date(assessmentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.title}>{title}</Text>
      {organizationName && (
        <Text style={pdfStyles.subtitle}>{organizationName}</Text>
      )}

      <View style={[pdfStyles.sectionContent, { marginTop: 12, marginBottom: 0 }]}>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Assessment Type:</Text>
          <Text style={pdfStyles.value}>{subject}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Subject:</Text>
          <Text style={pdfStyles.value}>{userName}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Date:</Text>
          <Text style={pdfStyles.value}>{formattedDate}</Text>
        </View>
      </View>
    </View>
  );
};
