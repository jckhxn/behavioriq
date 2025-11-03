import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface WelcomeEmailProps {
  userName: string;
  siteUrl?: string;
  siteName?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader={`Welcome to ${siteName}! Get started with your first assessment.`}>
      <EmailHeader title={`🎉 Welcome to ${siteName}!`} />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>
        <Text className="text-gray-700 mb-4">
          Welcome aboard! We're excited to help you gain valuable insights into
          behavioral patterns and development.
        </Text>

        <Heading as="h3" className="text-lg text-gray-900 mt-6 mb-3">
          Get Started:
        </Heading>

        <EmailSection background="gray" padding="md" className="border-l-4 border-blue-600 mb-3">
          <Text className="font-semibold m-0">📋 Create Assessments</Text>
          <Text className="text-sm text-gray-600 mt-2 mb-0">
            Conduct comprehensive behavioral assessments with our intuitive question flow.
          </Text>
        </EmailSection>

        <EmailSection background="gray" padding="md" className="border-l-4 border-blue-600 mb-3">
          <Text className="font-semibold m-0">🤖 AI-Powered Analysis</Text>
          <Text className="text-sm text-gray-600 mt-2 mb-0">
            Get personalized, AI-generated recommendations based on assessment results.
          </Text>
        </EmailSection>

        <EmailSection background="gray" padding="md" className="border-l-4 border-blue-600 mb-3">
          <Text className="font-semibold m-0">📊 Professional Reports</Text>
          <Text className="text-sm text-gray-600 mt-2 mb-0">
            Download beautifully designed PDF reports with visual score representations.
          </Text>
        </EmailSection>

        <div className="text-center my-6">
          <EmailButton href={`${siteUrl}/dashboard`}>
            Go to Dashboard
          </EmailButton>
        </div>

        <Text className="text-sm text-gray-600 mt-8">
          If you need any assistance getting started, our support team is here to help!
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
