import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface LicenseNotificationEmailProps {
  userName: string;
  licenseType: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  siteUrl?: string;
  siteName?: string;
}

export const LicenseNotificationEmail: React.FC<LicenseNotificationEmailProps> = ({
  userName,
  licenseType,
  expiryDate,
  daysUntilExpiry,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  const urgency = daysUntilExpiry <= 7 ? 'high' : 'medium';
  const gradient = urgency === 'high'
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';

  return (
    <EmailLayout preheader={`Your ${licenseType} license expires in ${daysUntilExpiry} days`}>
      <EmailHeader
        title="⚠️ License Expiration Notice"
        gradient={gradient}
      />

      <EmailSection>
        <Text className="text-lg text-gray-600 text-center mb-4">
          {daysUntilExpiry} days remaining
        </Text>

        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>

        <EmailSection background="gray" padding="md" className="border-l-4 border-orange-500 mb-4">
          <Text className="m-0 font-semibold">
            Your {licenseType} license will expire in {daysUntilExpiry} days.
          </Text>
          <Text className="mt-2 mb-0">
            Expiration Date: {new Date(expiryDate).toLocaleDateString()}
          </Text>
        </EmailSection>

        <Text className="text-gray-700 mb-4">
          To avoid service interruption and continue accessing your assessments,
          please renew your license before the expiration date.
        </Text>

        <Heading as="h3" className="text-lg text-gray-900 mt-6 mb-3">
          What happens when your license expires?
        </Heading>
        <ul className="text-gray-700 pl-5 mb-4">
          <li className="mb-2">Access to assessment tools will be restricted</li>
          <li className="mb-2">PDF report generation will be disabled</li>
          <li className="mb-2">AI-generated recommendations will be unavailable</li>
          <li className="mb-2">Historical assessment data will be preserved</li>
        </ul>

        <div className="text-center my-6">
          <EmailButton href={`${siteUrl}/dashboard?action=renew`}>
            Renew License Now
          </EmailButton>
        </div>

        <Text className="text-sm text-gray-600 mt-8">
          If you have any questions about license renewal, please contact our support team.
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
