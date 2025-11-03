import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiryMinutes?: number;
  siteUrl?: string;
  siteName?: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetUrl,
  expiryMinutes = 60,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader="Reset your password to regain access to your account">
      <EmailHeader title="🔐 Password Reset Request" />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>
        <Text className="text-gray-700 mb-4">
          We received a request to reset your password. Click the button below to
          create a new password.
        </Text>

        <div className="text-center my-6">
          <EmailButton href={resetUrl}>
            Reset Password
          </EmailButton>
        </div>

        <EmailSection background="gray" padding="md" className="mb-4">
          <Text className="text-sm text-gray-700 m-0">
            ⏱️ This link will expire in <strong>{expiryMinutes} minutes</strong> for security reasons.
          </Text>
        </EmailSection>

        <Text className="text-gray-700 mb-4">
          If you didn't request a password reset, you can safely ignore this email.
          Your password will not be changed.
        </Text>

        <EmailSection background="blue" padding="sm" className="mt-6">
          <Text className="text-xs text-gray-600 m-0">
            <strong>Security Tip:</strong> Never share your password or reset link with anyone.
            Our team will never ask for your password via email.
          </Text>
        </EmailSection>

        <Text className="text-sm text-gray-600 mt-8">
          If you're having trouble with the button above, copy and paste this URL into your browser:
        </Text>
        <Text className="text-xs text-gray-500 break-all">
          {resetUrl}
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
