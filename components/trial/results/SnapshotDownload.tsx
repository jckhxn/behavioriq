/**
 * Snapshot Download Component
 * Button to download watermarked snapshot PDF
 */

import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface SnapshotDownloadProps {
  onDownload: () => void;
  isLoading?: boolean;
}

export function SnapshotDownload({
  onDownload,
  isLoading = false,
}: SnapshotDownloadProps) {
  return (
    <section className="mb-8 p-6 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-4">
        <FileText className="w-8 h-8 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-foreground mb-2">
            <span className="font-semibold">Download your snapshot PDF</span> — includes the 3 key questions to ask your child's teacher.
          </p>
          <p className="text-xs text-muted-foreground">
            Full report adds teacher 1-pager, accommodations, and parent script.
          </p>
        </div>
        <Button
          onClick={onDownload}
          disabled={isLoading}
          size="lg"
          className="flex-shrink-0"
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          {isLoading ? 'Downloading...' : 'Download'}
        </Button>
      </div>
    </section>
  );
}
