"use client";

import { useSearchParams } from "next/navigation";
import { useUser } from "@/lib/hooks/use-supabase-user";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";

function CheckoutDirectContent() {
  const searchParams = useSearchParams();
  const { user, isLoading } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [childName, setChildName] = useState("");
  const [plan, setPlan] = useState("BASIC");

  useEffect(() => {
    const childNameParam = searchParams.get("childName");
    const planParam = searchParams.get("plan");

    if (childNameParam) {
      setChildName(decodeURIComponent(childNameParam));
    }
    if (planParam) {
      setPlan(planParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Auto-trigger checkout when user is authenticated
    if (!isLoading && user && !isProcessing) {
      handleCheckout();
    }
  }, [isLoading, user, isProcessing]);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please log in to continue");
      return;
    }

    console.log("Starting checkout process...", {
      childName,
      plan,
      userId: user.id,
    });
    setIsProcessing(true);

    try {
      const requestBody = {
        planType: "oneTime",
        plan: plan,
        childName: childName,
        isSubscription: false,
        fromDashboard: true, // User is authenticated, redirect back to dashboard after payment
      };

      console.log("Sending checkout request:", requestBody);

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Checkout response:", { status: response.status, data });

      if (response.ok && data.url) {
        console.log("Redirecting to Stripe:", data.url);
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        `Failed to process checkout: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to continue with your purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/login">Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-xl gradient-primary">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AI Diagnostic</span>
          </div>
          <CardTitle className="text-2xl">
            {isProcessing ? "Preparing Your Checkout..." : "Almost There!"}
          </CardTitle>
          <CardDescription>
            {isProcessing
              ? "We're redirecting you to secure payment processing..."
              : `Ready to get ${childName ? `${childName}'s` : "your"} comprehensive report`}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Redirecting to Stripe checkout...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Your Order:</p>
                <p className="text-lg font-bold">
                  Full AI Assessment Report - $97
                </p>
                {childName && (
                  <p className="text-sm text-muted-foreground">
                    For: {childName}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Includes 30-50 question assessment + cited recommendations +
                  school-ready PDF
                </p>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                Secure payment processing by Stripe
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CheckoutDirectWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutDirectContent />
    </Suspense>
  );
}

export default function CheckoutDirectPage() {
  return <CheckoutDirectWithSuspense />;
}
