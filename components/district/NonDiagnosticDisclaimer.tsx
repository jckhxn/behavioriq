"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface NonDiagnosticDisclaimerProps {
  variant?: "footer" | "inline";
}

export default function NonDiagnosticDisclaimer({
  variant = "footer",
}: NonDiagnosticDisclaimerProps) {
  if (variant === "inline") {
    return (
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Screening indicators only. Not a diagnosis.</strong> Use
          alongside professional judgment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-muted/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2">
        <p className="text-xs text-center text-muted-foreground">
          ℹ️ This tool provides screening insights to support educators. It does
          not diagnose or label students. All decisions should involve human
          judgment and appropriate professional consultation.
        </p>
      </div>
    </div>
  );
}
