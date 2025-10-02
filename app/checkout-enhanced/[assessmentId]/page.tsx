"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EnhancedCheckoutPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setAssessmentId(p.assessmentId));
  }, [params]);

  const handleCheckout = async () => {
    if (!assessmentId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/stripe/checkout-enhanced/${assessmentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout");
      }

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe checkout
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start checkout"
      );
      setIsLoading(false);
    }
  };

  if (!assessmentId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Unlock Enhanced Report</CardTitle>
          <CardDescription>
            Add your child's voice to the assessment with AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Child's Voice Documented</h3>
                <p className="text-sm text-muted-foreground">
                  Capture your child's responses in their own words
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">AI Comparative Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  See how parent and child perspectives align or differ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">School-Ready PDF</h3>
                <p className="text-sm text-muted-foreground">
                  Professional report suitable for educators and specialists
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Enhanced Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Actionable insights based on both perspectives
                </p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">One-time payment</span>
              <span className="text-3xl font-bold text-primary">$9</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Instant access • Lifetime availability • No subscription
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Maybe later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
