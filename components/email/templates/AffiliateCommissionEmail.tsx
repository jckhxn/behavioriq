import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface AffiliateCommissionEmailProps {
  userName: string;
  commissionAmount: string;
  referredUserName?: string;
  eventType: string;
  totalPayableBalance: string;
  payableCount: number;
  siteUrl?: string;
  siteName?: string;
}

export const AffiliateCommissionEmail: React.FC<AffiliateCommissionEmailProps> = ({
  userName,
  commissionAmount,
  referredUserName,
  eventType,
  totalPayableBalance,
  payableCount,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader={`You've earned ${commissionAmount} in referral commissions!`}>
      <EmailHeader
        title="💰 Congratulations!"
        gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>
        <Text className="text-gray-700 mb-4">
          Great news! You've earned a commission from your referral.
        </Text>

        <EmailSection background="gray" padding="md" className="mb-4 border-l-4 border-green-600">
          <Heading as="h3" className="text-2xl text-green-700 mt-0 mb-2">
            ${commissionAmount}
          </Heading>
          <Text className="text-sm text-gray-700 m-0">
            Commission earned for: <strong>{eventType}</strong>
          </Text>
          {referredUserName && (
            <Text className="text-sm text-gray-600 m-0 mt-1">
              Referred user: {referredUserName}
            </Text>
          )}
        </EmailSection>

        <EmailSection background="blue" padding="md" className="mb-4">
          <Text className="font-semibold text-gray-900 m-0 mb-2">
            💵 Current Payable Balance:
          </Text>
          <Heading as="h3" className="text-xl text-blue-700 m-0">
            ${totalPayableBalance}
          </Heading>
          <Text className="text-sm text-gray-600 m-0 mt-1">
            {payableCount} commission{payableCount !== 1 ? 's' : ''} ready for payout
          </Text>
        </EmailSection>

        <Text className="text-gray-700 mb-4">
          Your commission will be available for payout after the 14-day hold period.
          Once payable, you can request a payout from your dashboard.
        </Text>

        <div className="text-center my-6">
          <EmailButton href={`${siteUrl}/dashboard/earn-rewards`}>
            View Earnings Dashboard
          </EmailButton>
        </div>

        <Text className="text-sm text-gray-600 mt-8">
          Keep sharing your referral link to earn more rewards!
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
