import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface AffiliateWelcomeEmailProps {
  userName: string;
  referralCode: string;
  referralLink: string;
  commissionRate?: string;
  siteUrl?: string;
  siteName?: string;
}

export const AffiliateWelcomeEmail: React.FC<AffiliateWelcomeEmailProps> = ({
  userName,
  referralCode,
  referralLink,
  commissionRate = '$20',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader="Start earning rewards by referring friends and colleagues">
      <EmailHeader
        title="🎉 Welcome to the Affiliate Program!"
        gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>
        <Text className="text-gray-700 mb-4">
          Welcome to {siteName}'s Referral Program! You can now start earning rewards
          by referring friends and colleagues.
        </Text>

        <EmailSection background="gray" padding="md" className="mb-4 border-l-4 border-green-600">
          <Text className="font-semibold text-gray-900 m-0 mb-2">
            Your Referral Link:
          </Text>
          <Text className="font-mono text-sm text-gray-700 break-all m-0">
            {referralLink}
          </Text>
          <Text className="text-xs text-gray-600 mt-2 mb-0">
            Referral Code: <strong>{referralCode}</strong>
          </Text>
        </EmailSection>

        <Heading as="h3" className="text-lg text-gray-900 mt-6 mb-3">
          How It Works:
        </Heading>
        <ul className="text-gray-700 pl-5 mb-4">
          <li className="mb-2">Share your unique referral link</li>
          <li className="mb-2">Your friends get $20 off their first purchase</li>
          <li className="mb-2">You earn {commissionRate} for each qualified referral</li>
          <li className="mb-2">Earn bonuses when they upgrade to premium plans</li>
        </ul>

        <Heading as="h3" className="text-lg text-gray-900 mt-6 mb-3">
          Payout Terms:
        </Heading>
        <ul className="text-gray-700 pl-5 mb-4">
          <li className="mb-2">Earnings are held for 14 days (refund protection)</li>
          <li className="mb-2">Minimum payout threshold: $50</li>
          <li className="mb-2">Fast payouts via Stripe Connect</li>
          <li className="mb-2">1099-NEC tax forms for earnings ≥ $600/year</li>
        </ul>

        <div className="text-center my-6">
          <EmailButton href={`${siteUrl}/dashboard/earn-rewards`}>
            View Your Dashboard
          </EmailButton>
        </div>

        <Text className="text-sm text-gray-600 mt-8">
          Need help? Contact our support team at support@{siteName.toLowerCase().replace(/\s+/g, '')}.com
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
