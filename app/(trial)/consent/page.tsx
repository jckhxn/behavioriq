'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { trackTelemetry } from '@/lib/utils/telemetry';

export default function ConsentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [consent, setConsent] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preserve query params from referral links
  const queryParams = new URLSearchParams(searchParams.toString());

  const handleStart = async () => {
    if (!consent) {
      toast.error('Please accept consent to continue');
      return;
    }

    try {
      setLoading(true);

      // Start trial session
      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymous,
          region: undefined, // Could be detected from IP
          utm: {
            source: queryParams.get('utm_source'),
            medium: queryParams.get('utm_medium'),
            campaign: queryParams.get('utm_campaign'),
            content: queryParams.get('utm_content'),
            term: queryParams.get('utm_term'),
            ref: queryParams.get('ref'),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start trial');
      }

      const data = await response.json();
      const sessionId = data.sessionId;

      // Track consent acceptance
      trackTelemetry('trial.consent_accepted', {
        sessionId,
        anonymous,
        utm_source: queryParams.get('utm_source'),
        utm_campaign: queryParams.get('utm_campaign'),
      });

      // Redirect to profile
      router.push(`/trial/${sessionId}/profile`);
    } catch (error) {
      console.error('Failed to start trial:', error);
      toast.error('Unable to start assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">Behavior Assessment</CardTitle>
          </div>
          <CardDescription className="text-sm">Quick screening to guide next steps</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Info Section */}
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              This is a screening, not a diagnosis. Results help guide next steps with school or a clinician.
            </p>
            <p>
              We don't sell data. Reports are instant and AI stores no data. Anonymous Mode is available.
            </p>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked === true)}
              disabled={loading}
            />
            <Label
              htmlFor="consent"
              className="text-sm cursor-pointer flex-1 leading-relaxed pt-0.5 font-medium"
            >
              I am a parent/guardian (or authorized educator).
            </Label>
          </div>

          {/* Second checkbox - optional understanding */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <Checkbox
              id="understand"
              checked={consent}
              disabled
              className="opacity-50"
            />
            <Label
              htmlFor="understand"
              className="text-sm cursor-default flex-1 leading-relaxed pt-0.5 opacity-75"
            >
              I understand this is a screening, not a diagnosis.
            </Label>
          </div>

          {/* Anonymous Mode Toggle */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <Checkbox
              id="anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => setAnonymous(checked === true)}
              disabled={loading}
            />
            <Label
              htmlFor="anonymous"
              className="text-sm cursor-pointer flex-1 leading-relaxed pt-0.5"
            >
              <span className="font-semibold">Use Anonymous Mode</span> (don't show the child's name)
            </Label>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleStart}
            disabled={!consent || loading}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 enabled:hover:from-blue-700 enabled:hover:to-indigo-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              'Continue'
            )}
          </Button>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <a
              href="https://behavioriq.app/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Privacy
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://behavioriq.app/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Terms
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
