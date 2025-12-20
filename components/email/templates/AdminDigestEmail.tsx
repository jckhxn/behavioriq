import * as React from 'react';
import { Heading, Text } from '@react-email/components';
import { EmailLayout } from '../base/EmailLayout';
import { EmailHeader } from '../base/EmailHeader';
import { EmailFooter } from '../base/EmailFooter';
import { EmailButton } from '../base/EmailButton';
import { EmailSection } from '../base/EmailSection';

interface AdminDigestEmailProps {
  adminName: string;
  period?: 'daily' | 'weekly';
  stats?: {
    newUsers?: number;
    completedAssessments?: number;
    totalRevenue?: string;
    activeLicenses?: number;
    supportTickets?: number;
  };
  alerts?: Array<{
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
  dashboardUrl?: string;
  siteUrl?: string;
  siteName?: string;
}

export const AdminDigestEmail: React.FC<AdminDigestEmailProps> = ({
  adminName,
  period = 'daily',
  stats = {},
  alerts = [],
  dashboardUrl,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Diagnostic',
}) => {
  const periodLabel = period === 'daily' ? 'Daily' : 'Weekly';

  return (
    <EmailLayout preheader={`${periodLabel} Admin Digest`}>
      <EmailHeader
        title={`${periodLabel} Admin Report`}
        gradient="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
      />

      <EmailSection>
        <Heading className="text-xl text-gray-900 mb-4">
          Hi {adminName},
        </Heading>

        <Text className="text-gray-700 mb-6">
          Here's your {period === 'daily' ? 'daily' : 'weekly'} platform summary.
        </Text>

        {Object.keys(stats).length > 0 && (
          <>
            <Heading as="h3" className="text-lg text-gray-900 mb-3">
              📊 Platform Statistics
            </Heading>

            <EmailSection background="gray" padding="md" className="mb-4">
              {stats.newUsers !== undefined && (
                <Text className="m-0 mb-2 text-gray-700">
                  <strong>👥 New Users:</strong> {stats.newUsers}
                </Text>
              )}
              {stats.completedAssessments !== undefined && (
                <Text className="m-0 mb-2 text-gray-700">
                  <strong>✅ Assessments Completed:</strong> {stats.completedAssessments}
                </Text>
              )}
              {stats.totalRevenue && (
                <Text className="m-0 mb-2 text-gray-700">
                  <strong>💰 Total Revenue:</strong> {stats.totalRevenue}
                </Text>
              )}
              {stats.activeLicenses !== undefined && (
                <Text className="m-0 mb-2 text-gray-700">
                  <strong>📋 Active Licenses:</strong> {stats.activeLicenses}
                </Text>
              )}
              {stats.supportTickets !== undefined && (
                <Text className="m-0 mb-0 text-gray-700">
                  <strong>🎫 Support Tickets:</strong> {stats.supportTickets}
                </Text>
              )}
            </EmailSection>
          </>
        )}

        {alerts && alerts.length > 0 && (
          <>
            <Heading as="h3" className="text-lg text-gray-900 mb-3">
              ⚠️ Active Alerts
            </Heading>

            {alerts.map((alert, index) => {
              const bgColor = alert.severity === 'error' ? 'gray' : alert.severity === 'warning' ? 'gray' : 'blue';
              const borderColor = alert.severity === 'error' ? 'border-red-500' : alert.severity === 'warning' ? 'border-yellow-500' : 'border-blue-500';
              const icon = alert.severity === 'error' ? '❌' : alert.severity === 'warning' ? '⚠️' : 'ℹ️';

              return (
                <EmailSection key={index} background={bgColor} padding="md" className={`border-l-4 ${borderColor} mb-3`}>
                  <Text className="m-0 text-gray-700">
                    <strong>{icon} {alert.type}:</strong> {alert.message}
                  </Text>
                </EmailSection>
              );
            })}
          </>
        )}

        {dashboardUrl && (
          <div className="text-center mb-6 mt-6">
            <EmailButton href={dashboardUrl}>
              View Admin Dashboard
            </EmailButton>
          </div>
        )}

        <Heading as="h3" className="text-lg text-gray-900 mb-3">
          Quick Actions
        </Heading>
        <ul className="text-gray-700 pl-5 mb-6">
          <li className="mb-2">Review pending support tickets</li>
          <li className="mb-2">Monitor system health and performance</li>
          <li className="mb-2">Check license renewal status</li>
          <li className="mb-2">Review user feedback</li>
        </ul>

        <EmailSection background="gray" padding="md" className="mb-4">
          <Text className="m-0 text-sm text-gray-700">
            <strong>Tip:</strong> For detailed analytics and reports, visit your admin dashboard.
          </Text>
        </EmailSection>

        <Text className="text-sm text-gray-600 mt-8">
          Questions about the platform? Review your admin documentation or contact the support team.
        </Text>
      </EmailSection>

      <EmailFooter companyName={siteName} />
    </EmailLayout>
  );
};
