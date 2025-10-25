import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assessment - BehaviorIQ',
  description: 'Quick behavior assessment tool',
};

export default function TrialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
