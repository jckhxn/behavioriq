'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getResults,
  createCheckout,
  submitLead,
  downloadSnapshot,
  type TrialResults,
  type DomainScore,
} from '@/lib/api/trial';
import { toast } from 'sonner';
import { trackTelemetry } from '@/lib/utils/telemetry';

// Import components
import { ResultsHeader } from '@/components/trial/results/ResultsHeader';
import { RiskSummary } from '@/components/trial/results/RiskSummary';
import { ResultsCharts } from '@/components/trial/results/ResultsCharts';
import { FreeActions } from '@/components/trial/results/FreeActions';
import { PaidUpgrade } from '@/components/trial/results/PaidUpgrade';
import { MicroProof } from '@/components/trial/results/MicroProof';
import { EmailCapture } from '@/components/trial/results/EmailCapture';
import { SnapshotDownload } from '@/components/trial/results/SnapshotDownload';
import { ComplianceFootnotes } from '@/components/trial/results/ComplianceFootnotes';
import { StickyCta } from '@/components/trial/results/StickyCta';
import { LoadingPage } from '@/components/ui/loading';

type CtaState = 'BUY_PRIMARY' | 'EMAIL_PRIMARY' | 'DOWNLOAD_PRIMARY';

export default function ResultsPage() {
  const params = useParams();
  const trialId = params.trialId as string;

  const [data, setData] = useState<TrialResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ctaState, setCtaState] = useState<CtaState>('BUY_PRIMARY');
  const [coupon, setCoupon] = useState<{ code?: string; expiresAt?: string }>({});
  const [idle, setIdle] = useState(false);
  const [exitIntent, setExitIntent] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Fetch results on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const results = await getResults(trialId);
        setData(results);

        // Track initial page view
        trackTelemetry('trial.results_view', {
          trialId,
          sessionId: results.sessionId,
          anonymous: results.anonymous,
        });

        // Track offer impression
        trackTelemetry('trial.offer_view', {
          trialId,
          sessionId: results.sessionId,
          flagCount: results.flags.length,
        });
      } catch (err) {
        console.error('Failed to load results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load results');
        toast.error('Unable to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [trialId]);

  // Exit-intent detection (desktop only)
  useEffect(() => {
    if (exitIntent) return; // Only trigger once

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger on desktop (not mobile)
      if (window.innerWidth < 768) return;
      
      // Detect if mouse is leaving from top
      if (e.clientY <= 0 && e.clientX > 0) {
        setExitIntent(true);
        setCtaState('EMAIL_PRIMARY');
        trackTelemetry('trial.offer_decline', {
          reason: 'exit_intent',
          trialId,
          sessionId: data?.sessionId,
        });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitIntent, trialId, data?.sessionId]);

  // Idle timer: 30 seconds after data loads
  useEffect(() => {
    if (!data) return;

    const timer = setTimeout(() => {
      setIdle(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [data]);

  // Auto-transition to EMAIL_PRIMARY on idle
  useEffect(() => {
    if (idle && ctaState === 'BUY_PRIMARY') {
      setCtaState('EMAIL_PRIMARY');
      trackTelemetry('trial.offer_decline', {
        reason: 'idle_30s',
      });
    }
  }, [idle, ctaState]);

  const completedDate = useMemo(() => {
    if (!data) return '';
    return new Date(data.completedAt).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }, [data]);

  // Handle buy action
  const handleBuy = async () => {
    if (!data) return;

    try {
      trackTelemetry('trial.offer_click_buy', {
        trialId,
        sessionId: data.sessionId,
      });

      setIsCheckingOut(true);
      const response = await createCheckout({
        product: 'full_assessment',
        trialId,
        sessionId: data.sessionId,
        couponCode: coupon.code,
      });

      trackTelemetry('checkout.started', {
        trialId,
        sessionId: data.sessionId,
        source: 'trial_results',
      });

      // Redirect to Stripe checkout
      window.location.href = response.checkoutUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Unable to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  // Handle decline action
  const handleDecline = () => {
    if (!data) return;

    setCtaState('EMAIL_PRIMARY');
    trackTelemetry('trial.offer_decline', {
      reason: 'explicit_decline',
      trialId,
      sessionId: data.sessionId,
    });
  };

  // Handle lead submission
  const handleLeadSubmit = async (email: string, consentMarketing: boolean) => {
    if (!data) return;

    try {
      setIsSubmittingLead(true);
      const response = await submitLead({
        email,
        consentMarketing,
        trialId,
        sessionId: data.sessionId,
      });

      setCoupon({
        code: response.couponCode,
        expiresAt: response.couponExpiresAt,
      });

      setCtaState('DOWNLOAD_PRIMARY');

      trackTelemetry('trial.email_submit', {
        trialId,
        sessionId: data.sessionId,
        consentMarketing,
      });

      trackTelemetry('trial.coupon_timer_view', {
        couponCode: response.couponCode,
        expiresAt: response.couponExpiresAt,
      });

      toast.success('Check your email for your snapshot!');
    } catch (err) {
      console.error('Lead submission error:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Handle snapshot download
  const handleSnapshot = async () => {
    if (!data) return;

    try {
      const response = await downloadSnapshot({
        trialId,
        sessionId: data.sessionId,
      });

      trackTelemetry('trial.snapshot_download', {
        trialId,
        sessionId: data.sessionId,
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = response.pdfUrl;
      link.download = `snapshot-${trialId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Snapshot downloaded!');
    } catch (err) {
      console.error('Snapshot download error:', err);
      toast.error('Failed to download snapshot. Please try again.');
    }
  };

  if (loading) {
    return <LoadingPage text="Loading assessment results..." />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Unable to Load Results</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'Results not found. Please try again.'}
          </p>
          <a href="/consent" className="text-primary hover:underline">
            Start a new assessment
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8 mb-20 md:mb-0">
        {/* Section A: Results Header */}
        <ResultsHeader
          childLabel={data.childLabel}
          age={data.age}
          completedAt={completedDate}
        />

        {/* Section B: Risk Summary */}
        <RiskSummary flags={data.flags} />

        {/* Section C: Results Charts */}
        <ResultsCharts
          trialId={trialId}
          sessionId={data.sessionId}
          domains={data.domains}
          subdomains={data.subdomains}
        />

        {/* Section D: Free Actions */}
        <FreeActions />

        {/* Section E: Paid Upgrade (conditional) */}
        {ctaState === 'BUY_PRIMARY' && (
          <PaidUpgrade
            onBuy={handleBuy}
            onDecline={handleDecline}
            isLoading={isCheckingOut}
          />
        )}

        {/* Section F: Micro Proof */}
        <MicroProof />

        {/* Section G: Email Capture (conditional) */}
        {(ctaState === 'EMAIL_PRIMARY' || ctaState === 'DOWNLOAD_PRIMARY') && (
          <EmailCapture
            visible={true}
            onSubmit={handleLeadSubmit}
            couponExpiresAt={coupon.expiresAt}
            isLoading={isSubmittingLead}
            showSuccess={ctaState === 'DOWNLOAD_PRIMARY'}
            trialId={trialId}
            sessionId={data.sessionId}
          />
        )}

        {/* Section H: Snapshot Download (conditional) */}
        {ctaState === 'DOWNLOAD_PRIMARY' && (
          <SnapshotDownload onDownload={handleSnapshot} />
        )}

        {/* Section I: Compliance Footnotes */}
        <ComplianceFootnotes />
      </div>

      {/* Section J: Sticky CTA (mobile only) */}
      <StickyCta
        state={ctaState}
        onBuy={handleBuy}
        onEmailClick={() => setCtaState('EMAIL_PRIMARY')}
        onDownload={handleSnapshot}
        isLoading={isCheckingOut || isSubmittingLead}
      />
    </main>
  );
}
