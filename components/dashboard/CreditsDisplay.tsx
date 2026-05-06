"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
  CreditCard,
  Infinity as InfinityIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { AssessmentCreditsInfo } from "@/lib/services/assessment-credits-service";

export function CreditsDisplay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [credits, setCredits] = useState<AssessmentCreditsInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCredits();

    // Refresh credits when returning from a successful purchase
    const purchase = searchParams.get("purchase");
    if (purchase === "success") {
      // Add a small delay to ensure webhook has processed
      const timer = setTimeout(() => {
        fetchCredits();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
      } else if (response.status === 401) {
        // User is not authenticated - this is OK for trial/public pages
        // Don't show error, just don't display credits
        console.log("User not authenticated for credits display");
        setCredits(null);
      } else if (response.status === 503) {
        // Server configuration error
        const errorData = await response.json();
        console.error("Server configuration error:", errorData);
        toast.error("Server configuration error. Please contact support.");
        setCredits(null);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch credits:", errorData);
        throw new Error(errorData.error || "Failed to fetch credits");
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      // Only show error toast if it's not an auth/network issue
      if (
        error instanceof Error &&
        !error.message.includes("fetch") &&
        !error.message.includes("NetworkError")
      ) {
        toast.error("Failed to load assessment credits");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    // Use router to navigate with query params
    router.push("/?tab=settings&subtab=billing");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!credits) {
    return null;
  }

  const isUnlimited =
    credits.licenseType === "PROFESSIONAL" ||
    credits.licenseType === "ENTERPRISE";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
          Assessment Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {isUnlimited ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-2">
              <InfinityIcon className="h-5 w-5" />
              <span className="font-semibold">Unlimited Assessments</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You have unlimited access to assessments
            </p>
          </div>
        ) : (
          <>
            {/* Credits Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Available Credits</span>
                <span className="text-2xl font-bold">
                  {credits.creditsRemaining}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    credits.creditsRemaining === 0
                      ? "bg-destructive"
                      : credits.creditsRemaining <= 1
                        ? "bg-amber-500"
                        : "bg-primary"
                  }`}
                  style={{
                    width: `${(credits.creditsRemaining / Math.max(credits.creditsAllowed, 1)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {credits.creditsUsed} of {credits.creditsAllowed} credits used
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {credits.creditsRemaining === 0 ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium text-destructive">
                    No credits remaining
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Purchase more assessments to continue
                  </p>
                </div>
              ) : credits.creditsRemaining <= 1 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Running low on credits
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consider purchasing more
                  </p>
                </div>
              ) : null}

              <Link
                href="/checkout-direct"
                className={buttonVariants({ className: "w-full text-sm" })}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">
                  Purchase Assessment -{" "}
                </span>
                <span className="sm:hidden">Buy - </span>$97
              </Link>

              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={handleUpgradeClick}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Upgrade to </span>
                {credits.licenseType === "CORE" ||
                credits.licenseType === "ANNUAL_CORE"
                  ? "Family"
                  : credits.licenseType === "FAMILY" ||
                      credits.licenseType === "ANNUAL_FAMILY"
                    ? "Enterprise"
                    : "Core"}
              </Button>
            </div>

            {/* TRIAL license type removed - no longer used */}
            {/* {credits.licenseType === "TRIAL" && (
              <p className="text-xs text-center text-muted-foreground">
                Using trial license
              </p>
            )} */}
          </>
        )}
      </CardContent>
    </Card>
  );
}
