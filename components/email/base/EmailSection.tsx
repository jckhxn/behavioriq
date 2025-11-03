import * as React from 'react';
import { Section } from '@react-email/components';

interface EmailSectionProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'white' | 'gray' | 'blue' | 'transparent';
}

export const EmailSection: React.FC<EmailSectionProps> = ({
  children,
  className = '',
  padding = 'md',
  background = 'white',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12',
  };

  const backgroundStyles = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    transparent: 'bg-transparent',
  };

  return (
    <Section
      className={`${paddingStyles[padding]} ${backgroundStyles[background]} ${className}`}
    >
      {children}
    </Section>
  );
};
