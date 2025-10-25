/**
 * Guarantee Modal
 * Shows the 24-hour guarantee details
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Shield } from 'lucide-react';

export function GuaranteeModal() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
      >
        Guarantee details
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-950 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Our 24-Hour Guarantee</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground font-semibold">
            We guarantee you'll receive 3 concrete, school-ready actions in 24 hours—or we refund your full purchase.
          </p>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Your $97 gets you:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Teacher-ready 1-pager PDF</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>3 classroom accommodations</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Prewritten counselor email</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-300">
              If you don't find these 3 items in your PDF within 24 hours, contact us for a full refund. No questions asked.
            </p>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
