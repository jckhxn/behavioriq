import * as React from 'react';
import { Section, Text, Link, Hr } from '@react-email/components';

interface EmailFooterProps {
  companyName?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
  showSocial?: boolean;
}

export const EmailFooter: React.FC<EmailFooterProps> = ({
  companyName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
  unsubscribeUrl,
  preferencesUrl,
  showSocial = false,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <Section className="bg-gray-50 p-5 text-center">
      <Hr className="border-gray-300 my-5" />
      <Text className="text-xs text-gray-600 m-0">
        &copy; {currentYear} {companyName}. All rights reserved.
      </Text>
      <Text className="text-xs text-gray-500 mt-2">
        This is an automated message, please do not reply to this email.
      </Text>
      {(unsubscribeUrl || preferencesUrl) && (
        <Text className="text-xs text-gray-500 mt-2">
          {preferencesUrl && (
            <>
              <Link href={preferencesUrl} className="text-blue-600 underline">
                Email Preferences
              </Link>
              {unsubscribeUrl && ' | '}
            </>
          )}
          {unsubscribeUrl && (
            <Link href={unsubscribeUrl} className="text-gray-500 underline">
              Unsubscribe
            </Link>
          )}
        </Text>
      )}
    </Section>
  );
};
