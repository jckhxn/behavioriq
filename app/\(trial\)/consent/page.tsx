'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Shield, Lock, AlertCircle, Loader2 } from 'lucide-react';
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
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-3xl">Behavior Assessment</CardTitle>
              <CardDescription>Quick 10-question screening tool</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* What is this section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">What is this assessment?</h3>
            <p className="text-sm text-muted-foreground">
              This is a quick screening tool designed to help identify potential behavioral or developmental concerns. It takes about 5-7 minutes to complete and provides instant results with actionable next steps.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Important:</span> This is a screening tool, not a diagnosis. Results should be discussed with educators and healthcare providers.
            </p>
          </div>

          {/* How it works */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">How it works</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">1.</span>
                <span>Tell us a bit about the child (name optional, age required)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">2.</span>
                <span>Answer 10 quick questions about behavior and development</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">3.</span>
                <span>Get instant results with teacher 1-pager and action steps</span>
              </li>
            </ol>
          </div>

          {/* Privacy & Security */}
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy & Security
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex gap-2">
                <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Encrypted end-to-end. No data sold.</span>
              </p>
              <p className="flex gap-2">
                <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>FERPA/HIPAA compliant. AI sends no PII to external services.</span>
              </p>
              <p className="flex gap-2">
                <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Anonymous mode available. Names optional.</span>
              </p>
            </div>
          </div>

          {/* Consent Checkbox */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              By continuing, you confirm you are a parent, guardian, or authorized educator assessing a child in your care.
            </AlertDescription>
          </Alert>

          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
              disabled={loading}
            />
            <Label
              htmlFor="consent"
              className="text-sm cursor-pointer flex-1 leading-relaxed pt-0.5"
            >
              I understand this is a screening tool for reference only and not a diagnosis. I will discuss results with relevant professionals. I consent to use this assessment tool.
            </Label>
          </div>

          {/* Anonymous Mode Toggle */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <Checkbox
              id="anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => setAnonymous(checked as boolean)}
              disabled={loading}
            />
            <Label
              htmlFor="anonymous"
              className="text-sm cursor-pointer flex-1 leading-relaxed pt-0.5"
            >
              <span className="font-semibold">Keep this private</span> — Use anonymous mode. I won't provide the child's name.
            </Label>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleStart}
            disabled={!consent || loading}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Assessment...
              </>
            ) : (
              'Start Assessment'
            )}
          </Button>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center">
            Takes about 5-7 minutes. Your responses are encrypted and secure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
