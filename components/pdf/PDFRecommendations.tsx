import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './PDFDocument';

export interface PDFRecommendationsProps {
  recommendations: string;
  title?: string;
}

export const PDFRecommendations: React.FC<PDFRecommendationsProps> = ({
  recommendations,
  title = 'AI-Generated Recommendations',
}) => {
  // Parse recommendations - if it's a JSON string, parse it; otherwise treat as plain text
  let parsedRecommendations: string[] = [];

  try {
    // Try to parse as JSON first (in case it's an array)
    const parsed = JSON.parse(recommendations);
    if (Array.isArray(parsed)) {
      parsedRecommendations = parsed;
    } else if (typeof parsed === 'object' && parsed.recommendations) {
      parsedRecommendations = Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [parsed.recommendations];
    } else {
      parsedRecommendations = [recommendations];
    }
  } catch {
    // If JSON parsing fails, split by common separators or treat as single string
    if (recommendations.includes('\n\n')) {
      parsedRecommendations = recommendations.split('\n\n').filter(r => r.trim());
    } else if (recommendations.includes('\n')) {
      parsedRecommendations = recommendations.split('\n').filter(r => r.trim());
    } else {
      parsedRecommendations = [recommendations];
    }
  }

  return (
    <View style={pdfStyles.sectionContent}>
      <Text style={pdfStyles.sectionTitle}>{title}</Text>

      <View style={{ marginBottom: 12 }}>
        {parsedRecommendations.length === 0 ? (
          <View style={pdfStyles.recommendation}>
            <Text style={pdfStyles.recommendationContent}>
              No specific recommendations available at this time.
            </Text>
          </View>
        ) : (
          parsedRecommendations.map((rec, index) => (
            <View key={index} style={pdfStyles.recommendation}>
              <Text style={pdfStyles.recommendationTitle}>
                {index + 1}. Recommendation
              </Text>
              <Text style={pdfStyles.recommendationContent}>
                {typeof rec === 'string' ? rec : JSON.stringify(rec)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={{ marginTop: 12, padding: 8, backgroundColor: '#f0fdf4' }}>
        <Text style={{ fontSize: 9, color: '#166534', fontWeight: 'bold' }}>
          💡 Implementation Strategy:
        </Text>
        <Text style={{ fontSize: 9, color: '#15803d', marginTop: 4 }}>
          Prioritize recommendations based on impact and feasibility. Consider
          implementing high-impact items first, then gradually work through medium and
          low-priority recommendations. Regular monitoring and adjustment is key to success.
        </Text>
      </View>
    </View>
  );
};
