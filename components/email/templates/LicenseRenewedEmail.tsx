import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface LicenseRenewedEmailProps {
  userName: string;
  licenseType: string;
  newExpiryDate: Date;
  renewalAmount?: string;
  siteUrl?: string;
  siteName?: string;
}

export const LicenseRenewedEmail: React.FC<LicenseRenewedEmailProps> = ({
  userName,
  licenseType,
  newExpiryDate,
  renewalAmount,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader={`Your ${licenseType} license has been renewed`}>
      <EmailHeader
        title="✅ License Renewed Successfully"
        gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>
        <Text className="text-gray-700 mb-4">
          Great news! Your <strong>{licenseType}</strong> license has been successfully
          renewed and is now active.
        </Text>

        <EmailSection background="gray" padding="md" className="mb-4 border-l-4 border-green-600">
          <Text className="font-semibold text-gray-900 m-0 mb-2">
            License Details:
          </Text>
          <Text className="text-sm text-gray-700 m-0">
            Type: <strong>{licenseType}</strong>
          </Text>
          <Text className="text-sm text-gray-700 m-0">
            Valid Until: <strong>{new Date(newExpiryDate).toLocaleDateString()}</strong>
          </Text>
          {renewalAmount && (
            <Text className="text-sm text-gray-700 m-0">
              Renewal Amount: <strong>${renewalAmount}</strong>
            </Text>
          )}
        </EmailSection>

        <Heading as="h3" className="text-lg text-gray-900 mt-6 mb-3">
          Your Active Features:
        </Heading>
        <ul className="text-gray-700 pl-5 mb-4">
          <li className="mb-2">✅ Unlimited access to assessment tools</li>
          <li className="mb-2">✅ AI-powered report generation</li>
          <li className="mb-2">✅ Professional PDF exports</li>
          <li className="mb-2">✅ Personalized recommendations</li>
          <li className="mb-2">✅ Priority support</li>
        </ul>

        <div className="text-center my-6">
          <EmailButton href={`${siteUrl}/dashboard`}>
            Go to Dashboard
          </EmailButton>
        </div>

        <Text className="text-sm text-gray-600 mt-8">
          Thank you for continuing to use {siteName}. We're here to help you succeed!
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
