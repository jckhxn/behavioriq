import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface EmailChangeEmailProps {
  userName: string;
  newEmail: string;
  confirmationUrl: string;
  expiryHours?: number;
  siteName?: string;
}

export const EmailChangeEmail: React.FC<EmailChangeEmailProps> = ({
  userName,
  newEmail,
  confirmationUrl,
  expiryHours = 24,
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader="Confirm your new email address">
      <EmailHeader title="📧 Confirm Email Change" />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>
        <Text className="text-gray-700 mb-4">
          We received a request to change your email address. Please confirm this change
          by clicking the button below.
        </Text>

        <EmailSection background="gray" padding="md" className="mb-4 border-l-4 border-blue-600">
          <Text className="text-sm text-gray-700 m-0">
            New email address: <strong>{newEmail}</strong>
          </Text>
        </EmailSection>

        <div className="text-center my-6">
          <EmailButton href={confirmationUrl}>
            Confirm Email Change
          </EmailButton>
        </div>

        <EmailSection background="gray" padding="md" className="mb-4">
          <Text className="text-sm text-gray-700 m-0">
            ⏱️ This link will expire in <strong>{expiryHours} hours</strong> for security reasons.
          </Text>
        </EmailSection>

        <Text className="text-gray-700 mb-4">
          If you didn't request this email change, please ignore this message and your
          email address will remain unchanged.
        </Text>

        <EmailSection background="blue" padding="sm" className="mt-6">
          <Text className="text-xs font-semibold text-gray-900 m-0 mb-1">
            Security Note:
          </Text>
          <Text className="text-xs text-gray-600 m-0">
            After confirming this change, you'll need to use your new email address to
            sign in to {siteName}. We'll send a confirmation to both your old and new
            email addresses.
          </Text>
        </EmailSection>

        <Text className="text-sm text-gray-600 mt-8">
          If you're having trouble with the button above, copy and paste this URL into your browser:
        </Text>
        <Text className="text-xs text-gray-500 break-all">
          {confirmationUrl}
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
