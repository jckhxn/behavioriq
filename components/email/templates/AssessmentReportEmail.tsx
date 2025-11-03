import * as React from 'react';
import { Heading, Text, Link } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface AssessmentReportEmailProps {
  userName: string;
  assessmentName: string;
  assessmentId: string;
  siteUrl?: string;
  siteName?: string;
}

export const AssessmentReportEmail: React.FC<AssessmentReportEmailProps> = ({
  userName,
  assessmentName,
  assessmentId,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader={`Your ${assessmentName} assessment report is ready!`}>
      <EmailHeader title="📊 Your Assessment Report is Ready!" />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>
        <Text className="text-gray-700 mb-4">
          Your <strong>{assessmentName}</strong> assessment report has been generated
          and is attached to this email as a PDF.
        </Text>

        <EmailSection background="blue" padding="md" className="mb-4">
          <Text className="m-0 font-semibold text-gray-900">
            📄 Report Contents:
          </Text>
        </EmailSection>

        <ul className="text-gray-700 pl-5 mb-4">
          <li className="mb-2">Comprehensive behavioral analysis across all domains</li>
          <li className="mb-2">AI-generated personalized recommendations</li>
          <li className="mb-2">Visual score representations and risk assessments</li>
          <li className="mb-2">Actionable next steps for development</li>
        </ul>

        <Text className="text-gray-700 mb-4">
          You can also view your assessment online anytime from your dashboard.
        </Text>

        <div className="text-center my-6">
          <EmailButton href={`${siteUrl}/assessment/${assessmentId}`}>
            View Assessment Online
          </EmailButton>
        </div>

        <Text className="text-sm text-gray-600 mt-8">
          If you have any questions about your assessment results, please don't
          hesitate to contact our support team.
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
