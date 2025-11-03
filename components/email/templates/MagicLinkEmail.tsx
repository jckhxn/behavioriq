import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface MagicLinkEmailProps {
  userName?: string;
  loginUrl: string;
  expiryMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
  siteName?: string;
}

export const MagicLinkEmail: React.FC<MagicLinkEmailProps> = ({
  userName,
  loginUrl,
  expiryMinutes = 15,
  ipAddress,
  userAgent,
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader="Click to sign in to your account">
      <EmailHeader title="✨ Your Magic Link" />

      <EmailSection>
        {userName && (
          <Heading className="text-xl text-gray-900 mb-4">
            Hi {userName},
          </Heading>
        )}
        <Text className="text-gray-700 mb-4">
          Click the button below to securely sign in to your {siteName} account.
        </Text>

        <div className="text-center my-6">
          <EmailButton href={loginUrl}>
            Sign In to {siteName}
          </EmailButton>
        </div>

        <EmailSection background="gray" padding="md" className="mb-4">
          <Text className="text-sm text-gray-700 m-0">
            ⏱️ This link will expire in <strong>{expiryMinutes} minutes</strong> for security reasons.
          </Text>
        </EmailSection>

        <Text className="text-gray-700 mb-4">
          If you didn't request this login link, you can safely ignore this email.
        </Text>

        {(ipAddress || userAgent) && (
          <EmailSection background="blue" padding="sm" className="mt-6">
            <Text className="text-xs font-semibold text-gray-900 m-0 mb-2">
              Login Request Details:
            </Text>
            {ipAddress && (
              <Text className="text-xs text-gray-600 m-0">
                IP Address: {ipAddress}
              </Text>
            )}
            {userAgent && (
              <Text className="text-xs text-gray-600 m-0">
                Device: {userAgent}
              </Text>
            )}
          </EmailSection>
        )}

        <Text className="text-sm text-gray-600 mt-8">
          If you're having trouble with the button above, copy and paste this URL into your browser:
        </Text>
        <Text className="text-xs text-gray-500 break-all">
          {loginUrl}
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
