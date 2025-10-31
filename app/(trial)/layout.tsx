import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assessment - BehaviorIQ',
  description: 'Quick behavior assessment tool',
};

// Skip static prerendering for trial routes that use useSearchParams/useRouter
export const dynamic = 'force-dynamic';

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
