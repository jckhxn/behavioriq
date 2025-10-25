/**
 * Sample 1-Pager Modal
 * Shows a blurred/watermarked preview of the teacher-ready 1-pager
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { trackTelemetry } from '@/lib/utils/telemetry';

interface SampleModalProps {
  trialId?: string;
  sessionId?: string;
}

export function SampleModal({ trialId = '', sessionId = '' }: SampleModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    trackTelemetry('trial.sample_view', {
      trialId,
      sessionId,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        See a sample 1-pager (blurred)
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-950 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <h2 className="text-lg font-semibold">Sample Teacher 1-Pager</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sample Preview Image/Placeholder */}
          <div className="relative w-full aspect-[8.5/11] bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Blurred watermark effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 opacity-40 blur-sm">
                <div className="text-6xl font-bold text-slate-400">PREVIEW</div>
                <div className="text-sm text-slate-400">This is a blurred preview</div>
                <div className="text-sm text-slate-400">Unlock to see the full report</div>
              </div>
            </div>

            {/* Sample content structure visible behind blur */}
            <div className="p-6 space-y-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="space-y-2">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
              </div>

              <div className="space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">What's in your teacher 1-pager:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Child profile & assessment overview</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Domain scores with visual charts</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>3 classroom accommodations matched to concerns</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Talking points for parent-teacher conversation</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>School-ready PDF ready to print or email</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
          >
            Got it, unlock the full report
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You'll get the complete, unblurred 1-pager immediately after purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
