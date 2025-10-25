/**
 * Paid Upgrade Component
 * PRIMARY monetization block with sales copy from spec
 */

import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, Clock } from 'lucide-react';
import { SampleModal } from './SampleModal';
import { GuaranteeModal } from './GuaranteeModal';

interface PaidUpgradeProps {
  onBuy: () => void;
  onDecline: () => void;
  isLoading?: boolean;
  trialId?: string;
  sessionId?: string;
}

export function PaidUpgrade({
  onBuy,
  onDecline,
  isLoading = false,
  trialId = '',
  sessionId = '',
}: PaidUpgradeProps) {
  return (
    <section className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
      {/* Headline */}
      <h3 className="text-2xl font-bold text-foreground mb-4">
        Unlock Full, School-Ready Report — $97 (Instant PDF)
      </h3>

      {/* Main Features */}
      <div className="mb-6">
        <ul className="space-y-2">
          {[
            "Teacher-ready 1-pager for tomorrow's class",
            '3 classroom accommodations matched to flagged domains',
            'Parent email/script for counselor outreach',
            'Optional child conversation transcript add-on ($9)',
          ].map((feature) => (
            <li key={feature} className="flex gap-3 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What Happens Next 24h */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded border border-amber-200 dark:border-amber-800">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          What you'll get in the next 24 hours
        </p>
        <ul className="space-y-2">
          {[
            "You'll download a teacher-ready 1-pager.",
            "You'll send a prewritten email to the counselor.",
            "You'll have 3 accommodations to request.",
          ].map((outcome) => (
            <li key={outcome} className="flex gap-3 text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bonuses */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-semibold text-foreground mb-2">
          Bonuses included today
        </p>
        <ul className="space-y-1">
          {[
            '30-day progress check plan (re-screen + updated 1-pager)',
            '$20 coupon for a sibling/follow-up (valid 48h)',
          ].map((bonus) => (
            <li key={bonus} className="flex gap-2 text-sm text-foreground">
              <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span>{bonus}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Trust & Risk Reversal */}
      <div className="mb-6 space-y-2 text-sm">
        <p className="text-muted-foreground">
          Clinician-reviewed rubric • References: CDC / APA
        </p>
        <p className="font-semibold text-foreground">
          <GuaranteeModal />: 3 concrete, school-ready actions in 24h or refund.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Typical evaluations: $1,500–$3,000 and 6–12 weeks.
        </p>
        <p className="text-xs text-muted-foreground">
          <SampleModal trialId={trialId} sessionId={sessionId} />
        </p>
      </div>

      {/* Risk Math */}
      <div className="mb-6 p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
        <p className="text-xs text-red-700 dark:text-red-300 font-medium">
          ⚠️ Waiting 8 weeks = 40 school days without targeted supports.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onBuy}
          disabled={isLoading}
          size="lg"
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
        >
          {isLoading ? 'Starting checkout...' : 'Unlock Full Report — $97'}
        </Button>
        <Button
          onClick={onDecline}
          disabled={isLoading}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          No thanks
        </Button>
      </div>
    </section>
  );
}
