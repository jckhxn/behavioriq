import * as React from 'react';
import { Section, Img, Heading } from '@react-email/components';

interface EmailHeaderProps {
  title: string;
  logoUrl?: string;
  gradient?: string;
}

export const EmailHeader: React.FC<EmailHeaderProps> = ({
  title,
  logoUrl,
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}) => {
  return (
    <Section
      className="text-center text-white p-10"
      style={{ background: gradient }}
    >
      {logoUrl && (
        <Img
          src={logoUrl}
          alt="Logo"
          className="mx-auto mb-4"
          width="120"
          height="40"
        />
      )}
      <Heading className="m-0 text-[28px] font-bold">{title}</Heading>
    </Section>
  );
};
