import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface EmailVerificationEmailProps {
  userName: string;
  verificationUrl: string;
  expiryHours?: number;
  siteName?: string;
}

export const EmailVerificationEmail: React.FC<EmailVerificationEmailProps> = ({
  userName,
  verificationUrl,
  expiryHours = 24,
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader="Verify your email address to activate your account">
      <EmailHeader title="📧 Verify Your Email" />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>
        <Text className="text-gray-700 mb-4">
          Thanks for signing up for {siteName}! Please verify your email address to
          activate your account and get started.
        </Text>

        <div className="text-center my-6">
          <EmailButton href={verificationUrl}>
            Verify Email Address
          </EmailButton>
        </div>

        <EmailSection background="gray" padding="md" className="mb-4">
          <Text className="text-sm text-gray-700 m-0">
            ⏱️ This link will expire in <strong>{expiryHours} hours</strong>.
          </Text>
        </EmailSection>

        <Text className="text-gray-700 mb-4">
          Once verified, you'll have full access to all features including:
        </Text>

        <ul className="text-gray-700 pl-5 mb-4">
          <li className="mb-2">Create and manage assessments</li>
          <li className="mb-2">Generate AI-powered reports</li>
          <li className="mb-2">Access personalized recommendations</li>
          <li className="mb-2">Download professional PDF reports</li>
        </ul>

        <Text className="text-sm text-gray-600 mt-8">
          If you're having trouble with the button above, copy and paste this URL into your browser:
        </Text>
        <Text className="text-xs text-gray-500 break-all">
          {verificationUrl}
        </Text>

        <EmailSection background="blue" padding="sm" className="mt-6">
          <Text className="text-xs text-gray-600 m-0">
            If you didn't create an account with {siteName}, you can safely ignore this email.
          </Text>
        </EmailSection>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
