import * as React from 'react';
import { Button } from '@react-email/components';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const EmailButton: React.FC<EmailButtonProps> = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
}) => {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <Button
      href={href}
      className={`inline-block rounded-lg font-semibold no-underline text-center ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </Button>
  );
};
