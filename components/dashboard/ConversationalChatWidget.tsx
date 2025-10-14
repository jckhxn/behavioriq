"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConversationalAssessmentWrapper } from "@/components/assessment/ConversationalAssessmentWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Download, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ConversationalChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId?: string;
}

export default function ConversationalChatWidget({
  isOpen,
  onClose,
  assessmentId,
}: ConversationalChatWidgetProps) {
  const router = useRouter();
  const [showUpsell, setShowUpsell] = useState(false);
  const [completedAssessmentId, setCompletedAssessmentId] = useState<
    string | null
  >(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleComplete = async (responses: Record<string, boolean>) => {
    console.log("🎯 handleComplete called with responses:", responses);

    // Check if this was a trial or real assessment by looking at localStorage
    const trialResults = localStorage.getItem("conversationalTrialResults");
    console.log("🔍 Trial results from localStorage:", trialResults);

    if (trialResults) {
      // This was a trial - show upsell
      console.log("✅ Showing upsell for trial");
      const newAssessmentId = assessmentId || `temp_${Date.now()}`;
      setCompletedAssessmentId(newAssessmentId);
      setShowUpsell(true);
    } else {
      // This was a real assessment - close the widget and refresh dashboard
      console.log("📝 Real assessment - refreshing dashboard");
      onClose();
      // Trigger a page refresh to show the new assessment
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };


  const handlePurchaseConversational = async () => {
    setIsPurchasing(true);
    try {
      const response = await fetch("/api/stripe/checkout-conversational-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout");
      }

      const { url, redirectUrl } = await response.json();

      // If redirectUrl is provided (e.g., already included in subscription), use that
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (url) {
        // Otherwise redirect to Stripe checkout
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Failed to start checkout");
      setIsPurchasing(false);
    }
  };

  const handleCloseUpsell = () => {
    setShowUpsell(false);
    onClose();
    // Refresh the page to update the dashboard widget
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {!showUpsell ? (
          <>
            <DialogHeader className="p-6 pb-4 shrink-0 border-b">
              <DialogTitle className="text-2xl">
                Conversational Assessment
              </DialogTitle>
              <DialogDescription>
                Natural conversation with AI to understand your child's perspective
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <ConversationalAssessmentWrapper onComplete={handleComplete} />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Upsell Content After Completion */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Assessment Complete! 🎉
              </h2>
              <p className="text-muted-foreground">
                Great job! You've completed the conversational trial.
              </p>
            </div>

            {/* Conversational Assessment Upsell */}
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5 mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-2xl">
                    Unlock Your Full Conversational Assessment
                  </CardTitle>
                </div>
                <CardDescription className="text-base">
                  Get the complete conversational assessment with AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* What You Get */}
                <div className="space-y-3">
                  <p className="font-medium">Upgrade to the full conversational assessment:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                      <span>Complete conversational assessment with all behavioral domains</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                      <span>Full conversation transcript with all your responses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                      <span>AI-powered analysis and personalized insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                      <span>Detailed recommendations with expert citations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                      <span>Professional PDF report ready to share</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                      <span>Saved to your dashboard for lifetime access</span>
                    </li>
                  </ul>
                </div>

                {/* Pricing */}
                <div className="bg-background rounded-lg border-2 border-primary/20 p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    One-time payment
                  </p>
                  <p className="text-4xl font-bold text-primary mb-2">$9</p>
                  <p className="text-sm text-muted-foreground">
                    Instant access • No subscription required
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full text-base"
                    onClick={handlePurchaseConversational}
                    disabled={isPurchasing}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {isPurchasing ? "Processing..." : "Unlock Full Assessment - $9"}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleCloseUpsell}
                    disabled={isPurchasing}
                  >
                    Maybe Later
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Secure checkout • All data encrypted and confidential
                </p>
              </CardContent>
            </Card>

            {/* Close Button */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCloseUpsell}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
