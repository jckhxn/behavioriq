import React from 'react';
import { Document, Page, StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    fontSize: 11,
    color: '#333',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a202c',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#2d3748',
    backgroundColor: '#f7fafc',
    padding: 8,
  },
  sectionContent: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#2d3748',
  },
  value: {
    width: '60%',
    color: '#4a5568',
  },
  table: {
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeader: {
    backgroundColor: '#667eea',
    color: 'white',
    fontWeight: 'bold',
    padding: 8,
    flex: 1,
  },
  tableCell: {
    padding: 8,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  tableCellLast: {
    padding: 8,
    flex: 1,
    borderRightWidth: 0,
  },
  riskHigh: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  riskMedium: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  riskLow: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    fontSize: 9,
    color: '#718096',
    textAlign: 'center',
  },
  bulletPoint: {
    marginLeft: 12,
    marginBottom: 6,
  },
  recommendation: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    padding: 12,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2d3748',
  },
  recommendationContent: {
    fontSize: 10,
    color: '#4a5568',
  },
});

export interface PDFDocumentProps {
  children: React.ReactNode;
}

export const PDFDocumentComponent: React.FC<PDFDocumentProps> = ({ children }) => {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {children}
      </Page>
    </Document>
  );
};
