/**
 * Layout for trial-results route
 * Uses dynamic rendering to skip static prerendering since the page uses useSearchParams
 */

export const dynamic = 'force-dynamic';

export default function TrialResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
