import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface PaymentFailedEmailProps {
  userName: string;
  productName: string;
  amount: string;
  failureReason: string;
  retryUrl?: string;
  billingUrl?: string;
  timestamp?: Date;
  siteUrl?: string;
  siteName?: string;
}

export const PaymentFailedEmail: React.FC<PaymentFailedEmailProps> = ({
  userName,
  productName,
  amount,
  failureReason,
  retryUrl,
  billingUrl,
  timestamp = new Date(),
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader="Payment failed - Please update your payment method">
      <EmailHeader
        title="❌ Payment Failed"
        gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>

        <Text className="text-gray-700 mb-4">
          We were unable to process your payment for <strong>{productName}</strong>.
        </Text>

        <EmailSection background="gray" padding="md" className="border-l-4 border-red-500 mb-4">
          <Text className="m-0 font-semibold text-gray-900">
            Payment Details
          </Text>
          <Text className="mt-3 mb-0 text-gray-700">
            <strong>Product:</strong> {productName}
          </Text>
          <Text className="mt-2 mb-0 text-gray-700">
            <strong>Amount:</strong> {amount}
          </Text>
          <Text className="mt-2 mb-0 text-gray-700">
            <strong>Date:</strong> {new Date(timestamp).toLocaleString()}
          </Text>
          <Text className="mt-2 mb-0 text-gray-700">
            <strong>Reason:</strong> {failureReason}
          </Text>
        </EmailSection>

        <Heading as="h3" className="text-lg text-gray-900 mb-3">
          What should you do?
        </Heading>
        <ul className="text-gray-700 pl-5 mb-6">
          <li className="mb-2">Update your payment method information</li>
          <li className="mb-2">Ensure sufficient funds are available</li>
          <li className="mb-2">Verify your billing address matches your card</li>
          <li className="mb-2">Retry the payment to complete your subscription</li>
        </ul>

        <div className="text-center mb-6">
          {retryUrl ? (
            <EmailButton href={retryUrl}>
              Retry Payment
            </EmailButton>
          ) : (
            <EmailButton href={billingUrl || `${siteUrl}/settings/billing`}>
              Update Payment Method
            </EmailButton>
          )}
        </div>

        <EmailSection background="gray" padding="md" className="border-l-4 border-yellow-500 mb-4">
          <Text className="m-0 text-sm text-gray-700">
            <strong>Important:</strong> Your subscription may be suspended if payment is not received. Please update your payment method to avoid service interruption.
          </Text>
        </EmailSection>

        <Text className="text-gray-700 mb-4">
          If you continue to experience issues, our support team can help troubleshoot payment problems.
        </Text>

        <Text className="text-sm text-gray-600 mt-8">
          Need assistance? Reply to this email or contact our support team.
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
