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
import { AlertCircle, CreditCard, Sparkles } from "lucide-react";
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mx-auto mb-4 p-3 bg-amber-100 dark:bg-amber-950 rounded-full w-fit">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Assessment Limit Reached
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {/* TRIAL license type removed - no longer used */}
            <>
              You've used all {credits.creditsAllowed} of your available
              assessment credits.
            </>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Credits Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Credits Used</span>
              <span className="text-sm font-bold">
                {credits.creditsUsed} / {credits.creditsAllowed}
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{
                  width: `${(credits.creditsUsed / Math.max(credits.creditsAllowed, 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Single Assessment Purchase */}
            <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">
                      Purchase Single Assessment
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get 1 comprehensive assessment report with AI-powered
                    insights
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold text-lg">$97</div>
                  <div className="text-xs text-muted-foreground">one-time</div>
                </div>
              </div>
            </div>

            {/* Professional Upgrade */}
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5 relative">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap">
                  <Sparkles className="h-3 w-3" />
                  Best Value
                </span>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">
                    Upgrade to Professional
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Unlimited assessments + advanced features
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>✓ Unlimited assessments</li>
                    <li>✓ Priority support</li>
                    <li>✓ Advanced analytics</li>
                  </ul>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">$49</div>
                  <div className="text-xs text-muted-foreground">/month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={handlePurchase}
            disabled={isNavigating}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Purchase Assessment - $97
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={handleUpgrade}
            disabled={isNavigating}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Upgrade to Professional
          </Button>
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
