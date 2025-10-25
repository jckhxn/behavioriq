/**
 * Email Capture Component
 * Captures email + marketing consent, shows coupon timer on success
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Clock } from 'lucide-react';

interface EmailCaptureProps {
  visible: boolean;
  onSubmit: (email: string, consentMarketing: boolean) => void;
  couponExpiresAt?: string;
  isLoading?: boolean;
  showSuccess?: boolean;
}

export function EmailCapture({
  visible,
  onSubmit,
  couponExpiresAt,
  isLoading = false,
  showSuccess = false,
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const expiresIn = useMemo(() => {
    if (!couponExpiresAt) return null;
    return new Date(couponExpiresAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [couponExpiresAt]);

  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }
    onSubmit(email, consent);
    setSubmitted(true);
  };

  return (
    <section className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
      {showSuccess && submitted ? (
        // Success state with coupon timer
        <div className="space-y-4">
          <div className="flex gap-3 items-start p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
            <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                Your $20 coupon is ready!
              </p>
              <p className="text-xs text-green-700 dark:text-green-200 mt-1">
                Expires: {expiresIn}
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground">
            Check your email for your snapshot. Use your coupon when you're ready to unlock the full report.
          </p>
        </div>
      ) : (
        // Form state
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Email your snapshot + 3 questions to ask school
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get instant access to your snapshot PDF and key questions to ask your child's teacher.
            </p>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          {/* Marketing consent */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
              disabled={isLoading}
            />
            <Label
              htmlFor="consent"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              I agree to receive updates about BehaviorIQ features and offers
            </Label>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading || !email}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
          >
            {isLoading ? 'Sending...' : 'Send My Snapshot'}
          </Button>

          {/* Privacy note */}
          <p className="text-xs text-muted-foreground italic">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      )}
    </section>
  );
}
