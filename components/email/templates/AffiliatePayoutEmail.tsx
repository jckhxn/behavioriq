import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface AffiliatePayoutEmailProps {
  userName: string;
  payoutAmount: string;
  transferId: string;
  estimatedArrival?: string;
  payoutMethod?: string;
  siteUrl?: string;
  siteName?: string;
}

export const AffiliatePayoutEmail: React.FC<AffiliatePayoutEmailProps> = ({
  userName,
  payoutAmount,
  transferId,
  estimatedArrival = '1-3 business days',
  payoutMethod = 'Stripe Connect',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader={`Your referral payout of $${payoutAmount} has been sent!`}>
      <EmailHeader
        title="🎊 Payout Sent!"
        gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>
        <Text className="text-gray-700 mb-4">
          Your referral earnings have been transferred to your connected account.
        </Text>

        <EmailSection background="gray" padding="md" className="mb-4 border-l-4 border-blue-600">
          <Heading as="h3" className="text-2xl text-blue-700 mt-0 mb-2">
            ${payoutAmount}
          </Heading>
          <Text className="text-xs text-gray-600 m-0">
            Transfer ID: {transferId}
          </Text>
          <Text className="text-sm text-gray-700 m-0 mt-2">
            Expected arrival: <strong>{estimatedArrival}</strong>
          </Text>
        </EmailSection>

        <Text className="text-gray-700 mb-4">
          Your funds will be deposited to your bank account via {payoutMethod}. You can
          track your transfer in your Stripe dashboard.
        </Text>

        <EmailSection background="blue" padding="md" className="mb-4">
          <Text className="text-sm text-gray-700 m-0">
            💡 <strong>Tip:</strong> The actual arrival time may vary depending on your bank's
            processing schedule. Most transfers arrive within 1-3 business days.
          </Text>
        </EmailSection>

        <div className="text-center my-6">
          <EmailButton href={`${siteUrl}/dashboard/earn-rewards`}>
            View Payout History
          </EmailButton>
        </div>

        <Text className="text-sm text-gray-600 mt-8 text-center border-t border-gray-300 pt-6">
          Thank you for being part of {siteName}'s affiliate program! Keep sharing and earning. 🚀
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
