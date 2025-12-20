import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface SecurityAlertEmailProps {
  userName: string;
  alertType: 'login' | 'password_change' | 'mfa_enabled' | 'suspicious_activity' | 'api_key_created';
  details: string;
  timestamp?: Date;
  location?: string;
  actionUrl?: string;
  actionLabel?: string;
  siteUrl?: string;
  siteName?: string;
}

const alertConfig = {
  login: {
    title: '🔐 Login Activity',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    icon: '📱',
  },
  password_change: {
    title: '🔑 Password Changed',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    icon: '🔐',
  },
  mfa_enabled: {
    title: '✅ 2FA Enabled',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: '🛡️',
  },
  suspicious_activity: {
    title: '⚠️ Suspicious Activity Detected',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    icon: '🚨',
  },
  api_key_created: {
    title: '🔑 API Key Created',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icon: '🔧',
  },
};

export const SecurityAlertEmail: React.FC<SecurityAlertEmailProps> = ({
  userName,
  alertType,
  details,
  timestamp = new Date(),
  location,
  actionUrl,
  actionLabel = 'Review Activity',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  const config = alertConfig[alertType];
  const isSuspicious = alertType === 'suspicious_activity';

  return (
    <EmailLayout preheader={`Security alert: ${config.title}`}>
      <EmailHeader
        title={config.title}
        gradient={config.gradient}
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>

        <Text className="text-gray-700 mb-4">
          {config.icon} A security event has been detected on your account.
        </Text>

        <EmailSection background="gray" padding="md" className={`border-l-4 ${isSuspicious ? 'border-red-500' : 'border-blue-500'} mb-4`}>
          <Text className="m-0 font-semibold text-gray-900">
            Activity Details
          </Text>
          <Text className="mt-3 mb-0 text-gray-700">
            <strong>Type:</strong> {details}
          </Text>
          {timestamp && (
            <Text className="mt-2 mb-0 text-gray-700">
              <strong>Time:</strong> {new Date(timestamp).toLocaleString()}
            </Text>
          )}
          {location && (
            <Text className="mt-2 mb-0 text-gray-700">
              <strong>Location:</strong> {location}
            </Text>
          )}
        </EmailSection>

        {isSuspicious && (
          <>
            <Text className="text-red-600 font-semibold mb-4">
              ⚠️ This activity may be unauthorized. Please review immediately.
            </Text>

            <Heading as="h3" className="text-lg text-gray-900 mb-3">
              What should you do?
            </Heading>
            <ul className="text-gray-700 pl-5 mb-6">
              <li className="mb-2">Review this activity in your account settings</li>
              <li className="mb-2">Change your password if you don't recognize this activity</li>
              <li className="mb-2">Enable two-factor authentication if not already enabled</li>
              <li className="mb-2">Contact support if you don't recognize this activity</li>
            </ul>
          </>
        )}

        {actionUrl && (
          <div className="text-center mb-6">
            <EmailButton href={actionUrl}>
              {actionLabel}
            </EmailButton>
          </div>
        )}

        <EmailSection background="gray" padding="md" className="mb-4">
          <Text className="m-0 text-sm text-gray-600">
            <strong>Note:</strong> We take your security seriously. If you did not perform this action, please secure your account immediately.
          </Text>
        </EmailSection>

        <Text className="text-sm text-gray-600 mt-8">
          Questions? Our security team is available to help at any time.
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
