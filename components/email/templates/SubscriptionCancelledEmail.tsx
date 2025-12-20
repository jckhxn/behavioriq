import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface SubscriptionCancelledEmailProps {
  userName: string;
  planName: string;
  cancellationDate?: Date;
  finalAccessDate?: Date;
  cancellationReason?: string;
  feedbackUrl?: string;
  reactivateUrl?: string;
  siteUrl?: string;
  siteName?: string;
}

export const SubscriptionCancelledEmail: React.FC<SubscriptionCancelledEmailProps> = ({
  userName,
  planName,
  cancellationDate = new Date(),
  finalAccessDate,
  cancellationReason,
  feedbackUrl,
  reactivateUrl,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader="Your subscription has been cancelled">
      <EmailHeader
        title="📋 Subscription Cancelled"
        gradient="linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>

        <Text className="text-gray-700 mb-4">
          Your <strong>{planName}</strong> subscription has been successfully cancelled.
        </Text>

        <EmailSection background="gray" padding="md" className="border-l-4 border-gray-500 mb-4">
          <Text className="m-0 font-semibold text-gray-900">
            Cancellation Details
          </Text>
          <Text className="mt-3 mb-0 text-gray-700">
            <strong>Plan:</strong> {planName}
          </Text>
          <Text className="mt-2 mb-0 text-gray-700">
            <strong>Cancelled:</strong> {new Date(cancellationDate).toLocaleDateString()}
          </Text>
          {finalAccessDate && (
            <Text className="mt-2 mb-0 text-gray-700">
              <strong>Final Access Until:</strong> {new Date(finalAccessDate).toLocaleDateString()}
            </Text>
          )}
        </EmailSection>

        <Text className="text-gray-700 mb-6">
          You will retain access to your data and previously completed assessments. However, new assessment creation and advanced features will no longer be available after your current billing period ends.
        </Text>

        <Heading as="h3" className="text-lg text-gray-900 mb-3">
          What's Next?
        </Heading>
        <ul className="text-gray-700 pl-5 mb-6">
          <li className="mb-2">Your data remains safe and accessible</li>
          <li className="mb-2">Download important reports and assessments</li>
          <li className="mb-2">You can reactivate your subscription anytime</li>
          <li className="mb-2">No further charges will be made</li>
        </ul>

        {reactivateUrl && (
          <div className="text-center mb-6">
            <EmailButton href={reactivateUrl}>
              Reactivate Subscription
            </EmailButton>
          </div>
        )}

        {feedbackUrl && (
          <EmailSection background="blue" padding="md" className="mb-4">
            <Text className="m-0 text-sm text-gray-700">
              <strong>Your Feedback Matters:</strong> We'd love to know what we can improve. <a href={feedbackUrl} className="text-blue-600 underline">Share your feedback</a>.
            </Text>
          </EmailSection>
        )}

        {cancellationReason && (
          <Text className="text-sm text-gray-600 mb-4">
            <strong>Reason:</strong> {cancellationReason}
          </Text>
        )}

        <Text className="text-sm text-gray-600 mt-8">
          Have questions? Our team is here to help - feel free to reach out anytime.
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
