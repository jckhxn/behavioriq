import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface AffiliateFraudAlertEmailProps {
  userName: string;
  reason: string;
  actionTaken: string;
  appealUrl?: string;
  contactEmail?: string;
  siteUrl?: string;
  siteName?: string;
}

export const AffiliateFraudAlertEmail: React.FC<AffiliateFraudAlertEmailProps> = ({
  userName,
  reason,
  actionTaken,
  appealUrl,
  contactEmail = 'support@behavioriq.com',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  return (
    <EmailLayout preheader="Important: Action required on your affiliate account">
      <EmailHeader
        title="⚠️ Affiliate Account Alert"
        gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {userName},
        </Heading>
        <Text className="text-gray-700 mb-4">
          We've detected activity on your affiliate account that requires immediate attention.
        </Text>

        <EmailSection background="gray" padding="md" className="mb-4 border-l-4 border-red-600">
          <Text className="font-semibold text-red-800 m-0 mb-2">
            Reason for Alert:
          </Text>
          <Text className="text-sm text-gray-700 m-0">
            {reason}
          </Text>
        </EmailSection>

        <EmailSection background="gray" padding="md" className="mb-4 border-l-4 border-orange-600">
          <Text className="font-semibold text-orange-800 m-0 mb-2">
            Action Taken:
          </Text>
          <Text className="text-sm text-gray-700 m-0">
            {actionTaken}
          </Text>
        </EmailSection>

        <Heading as="h3" className="text-lg text-gray-900 mt-6 mb-3">
          What This Means:
        </Heading>
        <ul className="text-gray-700 pl-5 mb-4">
          <li className="mb-2">Your affiliate account has been temporarily restricted</li>
          <li className="mb-2">Pending commissions are on hold pending review</li>
          <li className="mb-2">New referrals may not be tracked during this period</li>
          <li className="mb-2">You have the right to appeal this decision</li>
        </ul>

        {appealUrl && (
          <>
            <Text className="text-gray-700 mb-4">
              If you believe this action was taken in error, you can submit an appeal
              for review by our team.
            </Text>
            <div className="text-center my-6">
              <EmailButton href={appealUrl}>
                Submit an Appeal
              </EmailButton>
            </div>
          </>
        )}

        <EmailSection background="blue" padding="sm" className="mt-6">
          <Text className="text-xs font-semibold text-gray-900 m-0 mb-1">
            Need Help?
          </Text>
          <Text className="text-xs text-gray-600 m-0">
            If you have questions about this alert or need assistance, please contact
            our support team at <strong>{contactEmail}</strong>. Include your affiliate
            ID and reference number in your message.
          </Text>
        </EmailSection>

        <Text className="text-sm text-gray-600 mt-8">
          We take affiliate program integrity seriously to protect all participants.
          Thank you for your understanding.
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
