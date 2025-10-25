/**
 * Sticky CTA Component
 * Mobile-only sticky footer that mirrors current CTA state
 */

import { Button } from '@/components/ui/button';
import { Mail, Download, ShoppingCart } from 'lucide-react';

type CtaState = 'BUY_PRIMARY' | 'EMAIL_PRIMARY' | 'DOWNLOAD_PRIMARY';

interface StickyCTAProps {
  state: CtaState;
  onBuy: () => void;
  onEmailClick: () => void;
  onDownload: () => void;
  isLoading?: boolean;
}

export function StickyCta({
  state,
  onBuy,
  onEmailClick,
  onDownload,
  isLoading = false,
}: StickyCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-3 md:hidden z-40">
      {state === 'BUY_PRIMARY' && (
        <Button
          onClick={onBuy}
          disabled={isLoading}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Unlock Full Report — $97
        </Button>
      )}

      {state === 'EMAIL_PRIMARY' && (
        <Button
          onClick={onEmailClick}
          disabled={isLoading}
          size="lg"
          className="w-full"
          variant="outline"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email My Snapshot
        </Button>
      )}

      {state === 'DOWNLOAD_PRIMARY' && (
        <Button
          onClick={onDownload}
          disabled={isLoading}
          size="lg"
          className="w-full"
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Snapshot
        </Button>
      )}
    </div>
  );
}
