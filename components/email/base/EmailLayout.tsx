import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Preview,
} from '@react-email/components';

interface EmailLayoutProps {
  preheader?: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  preheader,
  children,
}) => {
  return (
    <Html>
      <Head />
      {preheader && <Preview>{preheader}</Preview>}
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto my-0 max-w-[600px] bg-white">
          {children}
        </Container>
      </Body>
    </Html>
  );
};
