"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, Loader2, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";

function CheckoutAnonymousContent() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [childName, setChildName] = useState("");
  const [plan, setPlan] = useState("BASIC");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const childNameParam = searchParams.get("childName");
    const planParam = searchParams.get("plan");
    const userDataParam = searchParams.get("userData");

    if (childNameParam) {
      setChildName(decodeURIComponent(childNameParam));
    }
    if (planParam) {
      setPlan(planParam);
    }
    if (userDataParam) {
      try {
        const decodedUserData = JSON.parse(decodeURIComponent(userDataParam));
        setUserData(decodedUserData);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        toast.error("Invalid user data. Please try registering again.");
      }
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    if (!userData) {
      toast.error("Missing user information. Please try registering again.");
      return;
    }

    console.log("Starting anonymous checkout process...", {
      childName,
      plan,
      userEmail: userData.email,
    });
    setIsProcessing(true);

    try {
      const requestBody = {
        userData: userData,
        plan: plan,
        childName: childName,
      };

      console.log("Sending anonymous checkout request:", {
        ...requestBody,
        userData: { ...requestBody.userData, password: "[HIDDEN]" },
      });

      const response = await fetch("/api/stripe/checkout-anonymous", {
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

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <Brain className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Missing Information</CardTitle>
            <CardDescription>
              User registration data is missing. Please try the registration
              process again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/register?source=trial&redirect=checkout">
                Back to Registration
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 mb-4">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground">
              You're one step away from getting your comprehensive AI assessment
              report
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Full AI Report</h3>
                  <p className="text-sm text-muted-foreground">
                    {childName
                      ? `Assessment for ${childName}`
                      : "Comprehensive behavioral assessment"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">$97.00</div>
                  <div className="text-sm text-muted-foreground">one-time</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span>$97.00</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What you'll receive:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 30-50 question comprehensive assessment</li>
                  <li>• AI-generated professional report</li>
                  <li>• Personalized recommendations with sources</li>
                  <li>• School-ready PDF format</li>
                  <li>• Instant delivery</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium text-sm">
                    Account will be created after successful payment
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Email: {userData.email}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full text-lg px-8 py-4"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Secure Payment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              Powered by Stripe • Secure SSL encryption • 30-day money-back
              guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutAnonymousPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CheckoutAnonymousContent />
    </Suspense>
  );
}
