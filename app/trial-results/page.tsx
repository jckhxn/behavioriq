'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Legacy trial-results page
 * Redirects to new nested routes structure (/results/[trialId])
 * Attempts to read trialId from URL params or localStorage
 */
export default function TrialResultsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Try to get trialId from URL params
    let trialId = searchParams.get('trialId');

    // Fall back to localStorage
    if (!trialId && typeof window !== 'undefined') {
      trialId = localStorage.getItem('trial_id');
    }

    if (trialId) {
      // Redirect to new results page
      router.replace(`/results/${trialId}`);
    } else {
      // No trialId found, redirect to consent
      router.replace('/consent');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to results...</p>
      </div>
    </div>
  );
}
