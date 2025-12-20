import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface NewRecommendationEmailProps {
  userName: string;
  assessmentName: string;
  assessmentId: string;
  recommendationCount: number;
  topDomain?: string;
  siteUrl?: string;
  siteName?: string;
}

export const NewRecommendationEmail: React.FC<NewRecommendationEmailProps> = ({
  userName,
  assessmentName,
  assessmentId,
  recommendationCount = 1,
  topDomain = 'Behavioral Health',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader={`${recommendationCount} AI-generated recommendations available`}>
      <EmailHeader
        title="💡 New AI Recommendations"
        gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>

        <Text className="text-gray-700 mb-4">
          New AI-powered recommendations have been generated for your <strong>{assessmentName}</strong> assessment.
        </Text>

        <EmailSection background="blue" padding="md" className="border-l-4 border-blue-500 mb-4">
          <Text className="m-0 font-semibold text-gray-900">
            🤖 AI Analysis Complete
          </Text>
          <Text className="mt-3 mb-0 text-gray-700">
            <strong>{recommendationCount} recommendation{recommendationCount !== 1 ? 's' : ''}</strong> available based on {topDomain} analysis
          </Text>
          <Text className="mt-2 mb-0 text-gray-700">
            These evidence-based suggestions are tailored to your assessment results and can help guide intervention planning.
          </Text>
        </EmailSection>

        <Heading as="h3" className="text-lg text-gray-900 mb-3">
          Inside Your Recommendations:
        </Heading>
        <ul className="text-gray-700 pl-5 mb-6">
          <li className="mb-2">Evidence-based intervention strategies</li>
          <li className="mb-2">Targeted resources and references</li>
          <li className="mb-2">Actionable next steps</li>
          <li className="mb-2">Links to professional materials</li>
        </ul>

        <div className="text-center mb-6">
          <EmailButton href={`${siteUrl}/assessment/${assessmentId}/results?tab=recommendations`}>
            Review AI Recommendations
          </EmailButton>
        </div>

        <Text className="text-gray-700 mb-4">
          These recommendations are generated using AI analysis and should be reviewed by qualified professionals before implementation.
        </Text>

        <EmailSection background="gray" padding="md" className="mb-4">
          <Text className="m-0 text-sm text-gray-600">
            <strong>Pro Tip:</strong> Save or export these recommendations to share with your team or include in your documentation.
          </Text>
        </EmailSection>

        <Text className="text-sm text-gray-600 mt-8">
          Need help understanding the recommendations? Our support team is available to assist.
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
