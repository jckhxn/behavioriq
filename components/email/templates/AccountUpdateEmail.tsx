import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface AccountUpdateEmailProps {
  userName: string;
  updateType: 'profile_updated' | 'preferences_changed' | 'settings_modified' | 'subscription_changed';
  changes: string[];
  timestamp?: Date;
  actionUrl?: string;
  actionLabel?: string;
  siteUrl?: string;
  siteName?: string;
}

const updateConfig = {
  profile_updated: {
    title: '👤 Profile Updated',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    icon: '✏️',
  },
  preferences_changed: {
    title: '⚙️ Preferences Changed',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    icon: '🔧',
  },
  settings_modified: {
    title: '🔧 Settings Modified',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    icon: '⚙️',
  },
  subscription_changed: {
    title: '🎯 Subscription Updated',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    icon: '📊',
  },
};

export const AccountUpdateEmail: React.FC<AccountUpdateEmailProps> = ({
  userName,
  updateType,
  changes,
  timestamp = new Date(),
  actionUrl,
  actionLabel = 'Review Account',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  const config = updateConfig[updateType];

  return (
    <EmailLayout preheader={`Your ${config.title.toLowerCase().replace('✏️ ', '').replace('⚙️ ', '').replace('🔧 ', '').replace('🎯 ', '')}`}>
      <EmailHeader
        title={config.title}
        gradient={config.gradient}
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>

        <Text className="text-gray-700 mb-4">
          {config.icon} Your account has been updated.
        </Text>

        <EmailSection background="gray" padding="md" className="border-l-4 border-cyan-500 mb-4">
          <Text className="m-0 font-semibold text-gray-900">
            Changes Made
          </Text>
          <Text className="mt-3 mb-0 text-gray-700">
            <strong>Date:</strong> {new Date(timestamp).toLocaleString()}
          </Text>
        </EmailSection>

        {changes && changes.length > 0 && (
          <>
            <Heading as="h3" className="text-lg text-gray-900 mb-3">
              Modified Fields:
            </Heading>
            <ul className="text-gray-700 pl-5 mb-6">
              {changes.map((change, index) => (
                <li key={index} className="mb-2">
                  {change}
                </li>
              ))}
            </ul>
          </>
        )}

        <Text className="text-gray-700 mb-6">
          If you did not make these changes or have any concerns, please review your account settings immediately.
        </Text>

        {actionUrl && (
          <div className="text-center mb-6">
            <EmailButton href={actionUrl}>
              {actionLabel}
            </EmailButton>
          </div>
        )}

        <EmailSection background="blue" padding="md" className="mb-4">
          <Text className="m-0 text-sm text-gray-700">
            <strong>Tip:</strong> Keep your account information up-to-date for the best experience.
          </Text>
        </EmailSection>

        <Text className="text-sm text-gray-600 mt-8">
          Questions about these changes? Contact our support team.
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
