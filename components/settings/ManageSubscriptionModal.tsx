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
  TrendingUp,
  Users,
  Zap,
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
              <DialogTitle className="text-2xl font-bold">
                We don't want to see you go 👋
              </DialogTitle>
              <DialogDescription className="text-base pt-3 space-y-2">
                <p>
                  Most parents don't actually want to leave — they just need more flexibility or a temporary break. Here's what you'll miss:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3 md:grid-cols-4 text-sm font-medium text-foreground/80">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Progress tracking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>AI insights</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Member discount</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-orange-600" />
                    <span>Premium reports</span>
                  </div>
                </div>
                <p className="pt-2 font-semibold text-foreground">
                  Why not try one of these options instead?
                </p>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              {/* Option 1: Pause */}
              {showPauseOption && (
                <div className="border-2 border-green-500/30 rounded-lg p-4 bg-green-50 dark:bg-green-950/20 hover:border-green-500/60 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="rounded-full bg-green-600 p-2">
                      <Pause className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h4 className="font-bold text-green-900 dark:text-green-100">
                          Pause My Membership
                        </h4>
                        <span className="inline-block bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100 text-xs font-bold px-2 py-0.5 rounded">
                          MOST POPULAR
                        </span>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                        Take a break for 2 months. Zero charges. Everything stays safe.
                      </p>
                      <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                        <li>✓ 2 months free (no charges)</li>
                        <li>✓ Keep all reports & data</li>
                        <li>✓ Auto-resume in 2 months</li>
                        <li>✓ Cancel anytime</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    onClick={handlePause}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    {isProcessing && selectedAction === "pause" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Pause for 2 Months"
                    )}
                  </Button>
                </div>
              )}

              {/* Option 2: Downgrade to Lite */}
              {showLiteOption && (
                <div className="border-2 border-blue-500/30 rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20 hover:border-blue-500/60 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="rounded-full bg-blue-600 p-2">
                      <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
                        Switch to Lite Plan
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                        Save 50% and keep what matters most.
                      </p>
                      <div className="mb-2 p-2 bg-blue-100 dark:bg-blue-900/50 rounded text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Now just $14.50/month (was $29)
                      </div>
                      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <li>✓ Dashboard & progress tracking</li>
                        <li>✓ Keep all your reports</li>
                        <li>✓ 50% savings (saves you $29/month)</li>
                        <li>✓ Upgrade anytime</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    onClick={handleDowngrade}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold"
                  >
                    {isProcessing && selectedAction === "lite" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Switch to $14.50/month"
                    )}
                  </Button>
                </div>
              )}

              {/* Option 3: Switch to Annual */}
              {showAnnualOption && (
                <div className="border-2 border-purple-500/30 rounded-lg p-4 bg-purple-50 dark:bg-purple-950/20 hover:border-purple-500/60 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="rounded-full bg-purple-600 p-2">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h4 className="font-bold text-purple-900 dark:text-purple-100">
                          Switch to Annual
                        </h4>
                        <span className="inline-block bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 text-xs font-bold px-2 py-0.5 rounded">
                          BEST VALUE
                        </span>
                      </div>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                        Lock in the lowest price and save for a full year.
                      </p>
                      <div className="mb-2 p-2 bg-purple-100 dark:bg-purple-900/50 rounded text-sm font-semibold text-purple-900 dark:text-purple-100">
                        $249/year (30% off monthly rate)
                      </div>
                      <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                        <li>✓ Save $120/year vs monthly</li>
                        <li>✓ Best price guaranteed</li>
                        <li>✓ Full membership benefits</li>
                        <li>✓ Cancel anytime</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    onClick={handleSwitchToAnnual}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 font-semibold"
                  >
                    {isProcessing && selectedAction === "annual" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Lock in $249/year"
                    )}
                  </Button>
                </div>
              )}

              {/* Option 4: Cancel */}
              <div className="border-2 border-red-500/20 rounded-lg p-4 bg-red-50 dark:bg-red-950/20 hover:border-red-500/40 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="rounded-full bg-red-600 p-2">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-900 dark:text-red-100 mb-1">
                      Cancel Membership
                    </h4>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                      We'd really prefer one of the options above, but we understand.
                    </p>
                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-md mb-2">
                      <p className="text-xs font-semibold text-red-900 dark:text-red-100 mb-1">
                        You'll lose access to:
                      </p>
                      <ul className="text-xs text-red-800 dark:text-red-200 space-y-0.5">
                        <li>✗ Progress tracking for your child</li>
                        <li>✗ AI-powered insights & recommendations</li>
                        <li>✗ 20% member discount on future purchases</li>
                        <li>✗ Priority support & early feature access</li>
                      </ul>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                      Access ends {billingPeriodEnd ? formatDate(billingPeriodEnd) : "at end of billing period"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleCancelClick}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue with Cancellation"
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-900 dark:text-blue-100 font-medium">
                  💡 Pro Tip: Pausing is perfect if you're on a budget right now. Come back whenever you're ready!
                </p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-lg">
                <p className="text-xs text-slate-700 dark:text-slate-300 text-center">
                  Your child's progress and all reports stay safe. You can rejoin anytime.
                </p>
              </div>
            </div>
          </>
        )}

        {actionState === "confirm-cancel" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Last chance to reconsider 🛑
              </DialogTitle>
              <DialogDescription className="text-base pt-3 space-y-3">
                <p>
                  Canceling is permanent. You'll immediately lose access to:
                </p>
                <div className="grid grid-cols-2 gap-2 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                    <span className="text-red-900 dark:text-red-100">Progress tracking</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                    <span className="text-red-900 dark:text-red-100">AI insights</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                    <span className="text-red-900 dark:text-red-100">Member discounts</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                    <span className="text-red-900 dark:text-red-100">Priority support</span>
                  </div>
                </div>
                <p className="text-sm bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg text-yellow-900 dark:text-yellow-100 font-medium">
                  💭 Still need a break? Pausing costs nothing and keeps everything safe!
                </p>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-6">
              <Button
                onClick={handleBackToOptions}
                disabled={isProcessing}
                className="w-full font-semibold"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back to Options
              </Button>

              <Button
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                variant="destructive"
                className="w-full font-semibold"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  "Yes, Cancel My Membership"
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
              <DialogTitle className="text-2xl text-center font-bold">
                ✅ Done! You're all set
              </DialogTitle>
              <DialogDescription className="text-base pt-3 space-y-3 text-center">
                {selectedAction === "pause" && (
                  <>
                    <p className="font-semibold text-foreground">
                      Your membership is paused for 2 months
                    </p>
                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg space-y-2 text-sm text-left">
                      <p className="text-green-900 dark:text-green-100">
                        ✓ No charges for the next 2 months
                      </p>
                      <p className="text-green-900 dark:text-green-100">
                        ✓ All your reports and data are safe
                      </p>
                      <p className="text-green-900 dark:text-green-100">
                        ✓ We'll email you before reactivation
                      </p>
                      <p className="text-green-900 dark:text-green-100">
                        ✓ Cancel anytime if plans change
                      </p>
                    </div>
                  </>
                )}
                {selectedAction === "lite" && (
                  <>
                    <p className="font-semibold text-foreground">
                      Your plan has been downgraded
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg space-y-2 text-sm text-left">
                      <p className="text-blue-900 dark:text-blue-100">
                        ✓ New price: $14.50/month (saves you $14.50/mo)
                      </p>
                      <p className="text-blue-900 dark:text-blue-100">
                        ✓ Changes start next billing cycle
                      </p>
                      <p className="text-blue-900 dark:text-blue-100">
                        ✓ Keep your reports and dashboard
                      </p>
                      <p className="text-blue-900 dark:text-blue-100">
                        ✓ Upgrade anytime
                      </p>
                    </div>
                  </>
                )}
                {selectedAction === "annual" && (
                  <>
                    <p className="font-semibold text-foreground">
                      You're now on an annual plan
                    </p>
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg space-y-2 text-sm text-left">
                      <p className="text-purple-900 dark:text-purple-100">
                        ✓ Charged $249 for full year
                      </p>
                      <p className="text-purple-900 dark:text-purple-100">
                        ✓ Save $120/year vs monthly billing
                      </p>
                      <p className="text-purple-900 dark:text-purple-100">
                        ✓ All membership features included
                      </p>
                      <p className="text-purple-900 dark:text-purple-100">
                        ✓ Cancel anytime
                      </p>
                    </div>
                  </>
                )}
                {selectedAction === "cancel" && (
                  <>
                    <p className="font-semibold text-foreground">
                      Your membership has been canceled
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-900/30 p-3 rounded-lg space-y-2 text-sm text-left">
                      <p className="text-slate-700 dark:text-slate-300">
                        ✓ Access remains until {formatDate(billingPeriodEnd)}
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        ✓ All reports saved and available
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        ✓ No future charges
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        ✓ Rejoin anytime without losing progress
                      </p>
                    </div>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <Button onClick={handleClose} className="w-full mt-6 font-semibold" size="lg">
              Back to Dashboard
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
