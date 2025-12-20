import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface AssessmentCompleteEmailProps {
  userName: string;
  assessmentName: string;
  assessmentId: string;
  completedDate?: Date;
  riskLevel?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  siteUrl?: string;
  siteName?: string;
}

const riskColors = {
  LOW: '#10b981',
  MODERATE: '#f97316',
  HIGH: '#ef4444',
  VERY_HIGH: '#7c2d12',
};

export const AssessmentCompleteEmail: React.FC<AssessmentCompleteEmailProps> = ({
  userName,
  assessmentName,
  assessmentId,
  completedDate = new Date(),
  riskLevel = 'MODERATE',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  const riskColor = riskColors[riskLevel];
  const riskEmoji = {
    LOW: '✅',
    MODERATE: '⚠️',
    HIGH: '⚠️',
    VERY_HIGH: '🚨',
  }[riskLevel];

  return (
    <EmailLayout preheader={`${assessmentName} assessment completed - Review your results`}>
      <EmailHeader
        title="✅ Assessment Complete"
        gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>

        <Text className="text-gray-700 mb-4">
          Your assessment <strong>{assessmentName}</strong> has been completed successfully!
        </Text>

        <EmailSection background="gray" padding="md" className="border-l-4 border-green-500 mb-4">
          <Text className="m-0 font-semibold text-gray-900">
            📊 Assessment Summary
          </Text>
          <Text className="mt-3 mb-0 text-gray-700">
            <strong>Completed:</strong> {new Date(completedDate).toLocaleDateString()} at {new Date(completedDate).toLocaleTimeString()}
          </Text>
          {riskLevel && (
            <Text className="mt-2 mb-0 text-gray-700">
              <strong>Risk Level:</strong> <span style={{ color: riskColor, fontWeight: 'bold' }}>
                {riskEmoji} {riskLevel}
              </span>
            </Text>
          )}
        </EmailSection>

        <Text className="text-gray-700 mb-6">
          Review your detailed assessment results, risk analysis, and personalized recommendations.
          This information can help guide your next steps.
        </Text>

        <div className="text-center mb-6">
          <EmailButton href={`${siteUrl}/assessment/${assessmentId}/results`}>
            View Results & Recommendations
          </EmailButton>
        </div>

        <Heading as="h3" className="text-lg text-gray-900 mb-3">
          What happens next?
        </Heading>
        <ul className="text-gray-700 pl-5 mb-4">
          <li className="mb-2">Review your personalized recommendations</li>
          <li className="mb-2">Download a PDF report for your records</li>
          <li className="mb-2">Share results with relevant parties if needed</li>
          <li className="mb-2">Track changes over time with future assessments</li>
        </ul>

        <Text className="text-sm text-gray-600 mt-8">
          Questions about your results? Contact our support team for assistance.
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
