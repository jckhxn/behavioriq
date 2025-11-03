import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface SystemNotificationEmailProps {
  userName?: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  priority?: 'low' | 'medium' | 'high';
  siteName?: string;
}

export const SystemNotificationEmail: React.FC<SystemNotificationEmailProps> = ({
  userName,
  title,
  message,
  actionUrl,
  actionLabel,
  priority = 'medium',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  const gradients = {
    low: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    medium: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    high: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  };

  const icons = {
    low: '📬',
    medium: '📢',
    high: '⚠️',
  };

  return (
    <EmailLayout preheader={title}>
      <EmailHeader
        title={`${icons[priority]} ${title}`}
        gradient={gradients[priority]}
      />

      <EmailSection>
        {userName && (
          <Heading className="text-xl text-gray-900 mb-4">
            Hi {userName},
          </Heading>
        )}

        <Text className="text-gray-700 mb-4 whitespace-pre-line">
          {message}
        </Text>

        {actionUrl && actionLabel && (
          <div className="text-center my-6">
            <EmailButton href={actionUrl}>
              {actionLabel}
            </EmailButton>
          </div>
        )}

        {priority === 'high' && (
          <EmailSection background="gray" padding="md" className="mt-6 border-l-4 border-red-600">
            <Text className="text-sm text-red-800 m-0 font-semibold">
              ⚡ This is a high-priority notification that requires your attention.
            </Text>
          </EmailSection>
        )}
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
