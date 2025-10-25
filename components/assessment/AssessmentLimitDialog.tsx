"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CreditCard,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";
import type { AssessmentCreditsInfo } from "@/lib/services/assessment-credits-service";

interface AssessmentLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credits: AssessmentCreditsInfo;
  childName?: string;
}

export function AssessmentLimitDialog({
  open,
  onOpenChange,
  credits,
  childName,
}: AssessmentLimitDialogProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handlePurchase = () => {
    setIsNavigating(true);
    const params = new URLSearchParams();
    if (childName) {
      params.set("childName", childName);
    }
    router.push(`/checkout-direct?${params.toString()}`);
  };

  const handleUpgrade = () => {
    setIsNavigating(true);
    // Close the dialog first
    onOpenChange(false);
    // Navigate to settings tab with billing subtab to trigger scroll to upgrade section
    router.push("/?tab=settings&subtab=billing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-950 rounded-full w-fit">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Out of Assessment Credits
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-3 space-y-2">
            <p>
              You've completed {credits.creditsUsed} out of {credits.creditsAllowed} assessments.
            </p>
            <p className="font-semibold text-foreground">
              Here's your next step:
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {/* Credits Usage Summary */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-foreground">Progress</span>
              <span className="text-sm font-bold text-primary">
                {credits.creditsUsed} / {credits.creditsAllowed} completed
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all"
                style={{
                  width: `${(credits.creditsUsed / Math.max(credits.creditsAllowed, 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Quick Buy Option */}
          <div className="border-2 border-primary/30 rounded-2xl p-5 bg-primary/5 hover:border-primary/60 transition-colors">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/20 p-3 flex-shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">
                  Quick Purchase
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Get one comprehensive assessment with AI-powered insights immediately.
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-primary">$97</span>
                  <span className="text-sm text-muted-foreground">one-time</span>
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={isNavigating}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Purchase Now - $97
                </Button>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
              💡 Better Value: Upgrade to Monthly
            </p>

            {/* Core Plan */}
            <div className="border-2 border-blue-500/30 rounded-2xl p-5 bg-blue-50 dark:bg-blue-950/20 hover:border-blue-500/60 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-1">
                    Core Membership
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    2 assessments per month + rollover protection
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">$59</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">/month</div>
                </div>
              </div>
              <ul className="space-y-2 mb-4 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>2 assessment credits per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Credits roll over (max 6)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>$77 per additional assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Priority email support</span>
                </li>
              </ul>
              <Button
                onClick={handleUpgrade}
                disabled={isNavigating}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Upgrade to Core
              </Button>
            </div>

            {/* Family Plan */}
            <div className="border-2 border-purple-500/30 rounded-2xl p-5 bg-purple-50 dark:bg-purple-950/20 hover:border-purple-500/60 transition-colors relative">
              <div className="absolute -top-3 left-4">
                <span className="inline-block bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </span>
              </div>
              <div className="flex items-start justify-between mb-4 mt-3">
                <div>
                  <h4 className="font-bold text-lg text-purple-900 dark:text-purple-100 mb-1">
                    Family Membership
                  </h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    5 assessments per month + unlimited features
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">$99</div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">/month</div>
                </div>
              </div>
              <ul className="space-y-2 mb-4 text-sm text-purple-800 dark:text-purple-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>5 assessment credits per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Unlimited conversational AI sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Multi-child profile management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Priority support + live chat</span>
                </li>
              </ul>
              <Button
                onClick={handleUpgrade}
                disabled={isNavigating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Family
              </Button>
            </div>
          </div>

          {/* Trust & Safety Info */}
          <div className="bg-slate-100 dark:bg-slate-900/30 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-700 dark:text-slate-300 text-center">
              🔒 Your child's data is secure and private. FERPA/HIPAA compliant. No data sharing.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
            disabled={isNavigating}
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
