"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Pause,
  TrendingDown,
  Calendar,
  XCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ManageSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: "MONTHLY" | "ANNUAL" | "LITE";
  currentPrice: number; // in cents
  billingPeriodEnd?: string; // ISO date string
}

type ActionState = "options" | "confirm-cancel" | "success" | "loading";
type ActionType = "pause" | "lite" | "annual" | "cancel" | null;

export function ManageSubscriptionModal({
  open,
  onOpenChange,
  currentPlan,
  currentPrice,
  billingPeriodEnd,
}: ManageSubscriptionModalProps) {
  const router = useRouter();
  const [actionState, setActionState] = useState<ActionState>("options");
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "your next billing date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePause = async () => {
    setIsProcessing(true);
    setSelectedAction("pause");

    try {
      const response = await fetch("/api/subscription/pause", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to pause subscription");
      }

      setActionState("success");
    } catch (error) {
      console.error("Error pausing subscription:", error);
      toast.error("Failed to pause subscription. Please try again.");
      setActionState("options");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDowngrade = async () => {
    setIsProcessing(true);
    setSelectedAction("lite");

    try {
      const response = await fetch("/api/subscription/change-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "LITE" }),
      });

      if (!response.ok) {
        throw new Error("Failed to downgrade subscription");
      }

      setActionState("success");
    } catch (error) {
      console.error("Error downgrading subscription:", error);
      toast.error("Failed to downgrade subscription. Please try again.");
      setActionState("options");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwitchToAnnual = async () => {
    setIsProcessing(true);
    setSelectedAction("annual");

    try {
      const response = await fetch("/api/subscription/change-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "ANNUAL" }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch to annual plan");
      }

      setActionState("success");
    } catch (error) {
      console.error("Error switching to annual:", error);
      toast.error("Failed to switch to annual plan. Please try again.");
      setActionState("options");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelClick = () => {
    setActionState("confirm-cancel");
  };

  const handleConfirmCancel = async () => {
    setIsProcessing(true);
    setSelectedAction("cancel");

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      setActionState("success");
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription. Please try again.");
      setActionState("confirm-cancel");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToOptions = () => {
    setActionState("options");
    setSelectedAction(null);
  };

  const handleClose = () => {
    if (
      selectedAction === "cancel" ||
      selectedAction === "pause" ||
      selectedAction === "lite" ||
      selectedAction === "annual"
    ) {
      // Refresh the page or update parent component
      router.refresh();
    }
    setActionState("options");
    setSelectedAction(null);
    onOpenChange(false);
  };

  // Determine which options to show based on current plan
  const showPauseOption = true;
  const showLiteOption = currentPlan === "MONTHLY" && currentPrice >= 2900;
  const showAnnualOption = currentPlan === "MONTHLY" || currentPlan === "LITE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {actionState === "options" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Before you go…</DialogTitle>
              <DialogDescription className="text-base pt-2">
                Most parents don't want to cancel — they just want more
                flexibility or a little break.
                <br />
                <span className="font-medium text-foreground">
                  Choose what fits you best below 👇
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              {/* Option 1: Pause */}
              {showPauseOption && (
                <div className="border-2 border-green-500/30 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-start gap-3 mb-3">
                    <Pause className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Pause My Membership (2 Months Free Hold)
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Take a short break — we'll pause your billing for 2
                        months and keep all your reports, insights, and data
                        safe. You'll automatically resume after your pause ends.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handlePause}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isProcessing && selectedAction === "pause" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Pause My Account"
                    )}
                  </Button>
                </div>
              )}

              {/* Option 2: Downgrade to Lite */}
              {showLiteOption && (
                <div className="border-2 border-blue-500/30 rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3 mb-3">
                    <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Downgrade to Lite Plan ($14.50/mo)
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                        Keep access to your reports and dashboard for half the
                        cost.
                      </p>
                      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <li>
                          • Still includes progress tracking & dashboard access
                        </li>
                        {/* Enhanced report pricing removed */}
                        {/* <li>• Keep $9 Enhanced Reports instead of $29</li> */}
                        <li>• Access to all your previous reports</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    onClick={handleDowngrade}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    {isProcessing && selectedAction === "lite" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Downgrade to Lite Plan"
                    )}
                  </Button>
                </div>
              )}

              {/* Option 3: Switch to Annual */}
              {showAnnualOption && (
                <div className="border-2 border-purple-500/30 rounded-lg p-4 bg-purple-50 dark:bg-purple-950/20">
                  <div className="flex items-start gap-3 mb-3">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                        Switch to Annual (Save 30%)
                      </h4>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        Most parents switch to the annual plan — save 30% on
                        your subscription.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSwitchToAnnual}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
                  >
                    {isProcessing && selectedAction === "annual" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Switch to Annual — $249/year"
                    )}
                  </Button>
                </div>
              )}

              {/* Option 4: Cancel */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-start gap-3 mb-3">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Still Cancel My Account
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      We'll be sad to see you go, but you can cancel instantly
                      below. You'll keep access until your current billing
                      period ends.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleCancelClick}
                  disabled={isProcessing}
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-destructive"
                >
                  Cancel My Membership
                </Button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Your data and previous reports will remain securely stored. You
                can rejoin anytime without losing progress.
              </p>
            </div>
          </>
        )}

        {actionState === "confirm-cancel" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-destructive">
                Just confirming — you'll lose access to new reports and member
                discounts.
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Are you sure you want to cancel? You can always pause or
                downgrade instead.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-6">
              <Button
                onClick={handleBackToOptions}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>

              <Button
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Cancel"
                )}
              </Button>
            </div>
          </>
        )}

        {actionState === "success" && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <DialogTitle className="text-2xl text-center">
                ✅ All Set!
              </DialogTitle>
              <DialogDescription className="text-base pt-2 text-center">
                {selectedAction === "pause" && (
                  <>
                    We've paused your membership. We'll email you before
                    reactivation in 2 months.
                  </>
                )}
                {selectedAction === "lite" && (
                  <>
                    Your new $14.50/mo plan starts next billing cycle on{" "}
                    {formatDate(billingPeriodEnd)}.
                  </>
                )}
                {selectedAction === "annual" && (
                  <>
                    Your new annual plan begins immediately. You'll be charged
                    $249 for the year.
                  </>
                )}
                {selectedAction === "cancel" && (
                  <>
                    You'll retain access until {formatDate(billingPeriodEnd)}.
                    You can rejoin anytime.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <Button onClick={handleClose} className="w-full mt-6" size="lg">
              Back to Dashboard
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
