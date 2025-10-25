/**
 * Compliance Footnotes Component
 * Privacy and compliance information
 */

import { Shield, Lock } from 'lucide-react';

export function ComplianceFootnotes() {
  return (
    <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex gap-2 text-xs text-muted-foreground mb-4">
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          AI stores no data • Anonymous mode available • Encrypted • Designed to support FERPA/HIPAA
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        BehaviorIQ is a screening tool to support conversations with educators and healthcare providers. Results are not diagnostic and should not be considered a substitute for professional assessment or consultation.
      </p>
    </footer>
  );
}
