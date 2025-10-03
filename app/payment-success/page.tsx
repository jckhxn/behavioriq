"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  CheckCircle,
  Mail,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { toast } from "sonner";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [childName, setChildName] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(true);

  useEffect(() => {
    const childNameParam = searchParams.get("childName");
    if (childNameParam) {
      setChildName(decodeURIComponent(childNameParam));
    }

    // Attempt auto-login
    const attemptAutoLogin = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (!sessionId) {
        setIsLoggingIn(false);
        return;
      }

      try {
        // Get session data from Stripe including login token
        const sessionResponse = await fetch(
          `/api/stripe/session?session_id=${sessionId}`
        );
        const sessionData = await sessionResponse.json();

        if (!sessionData.loginToken) {
          console.log("No login token found in session");
          setIsLoggingIn(false);
          return;
        }

        // Validate token and get user data
        const tokenResponse = await fetch("/api/auth/login-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: sessionData.loginToken }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.success && tokenData.user) {
          // Sign in with NextAuth
          const { signIn } = await import("next-auth/react");
          const result = await signIn("credentials", {
            email: tokenData.user.email,
            password: "", // Token-based login, no password needed
            loginToken: sessionData.loginToken,
            redirect: false,
          });

          if (result?.ok) {
            // Redirect to dashboard
            window.location.href = "/dashboard";
            return;
          }
        }

        // If auto-login fails, show the page
        setIsLoggingIn(false);
      } catch (error) {
        console.error("Auto-login error:", error);
        setIsLoggingIn(false);
      }
    };

    attemptAutoLogin();
  }, [searchParams]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType: "subscription",
          plan: "MONTHLY",
          childName: childName,
          isSubscription: true,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe checkout for subscription
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create upgrade session");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to process upgrade. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  // Show loading state while attempting auto-login
  if (isLoggingIn) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Setting up your account...</h3>
            <p className="text-muted-foreground">You'll be redirected to your dashboard in a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-xl gradient-primary">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AI Diagnostic</span>
          </div>
        </div>

        {/* Hero / Confirmation Section */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 mb-8">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl text-green-800 dark:text-green-200 mb-2">
              🎉 Payment Successful!
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300 text-lg mb-6">
              Your account is ready, and your child's full AI assessment report
              is available instantly.
            </CardDescription>
            <div className="pt-4">
              <Button
                asChild
                className="w-full md:w-auto text-lg px-8"
                size="lg"
              >
                <Link href="/login">
                  👉 Access Your Report Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* What Happens Next (3-Step Section) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Happens Next</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Immediate</h4>
                  <p className="text-muted-foreground">
                    A confirmation email with your login details is on the way.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Right Now</h4>
                  <p className="text-muted-foreground">
                    Log in to your dashboard to view your full report,
                    recommendations, and school-ready PDF.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ongoing</h4>
                  <p className="text-muted-foreground">
                    Use your dashboard to track results, access resources, and
                    add more assessments anytime.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upsell Intro Section (Pattern Interrupt) */}
        <Card className="border-2 border-yellow-200 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">
              🎁 Special Upgrade Offer (One-Time Only)
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
              You just saved $1,500–$3,000 compared to a traditional evaluation.
              <br />
              But what if you could get ongoing clarity instead of a one-time
              snapshot?
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Comparison Section (Two-Column Layout) */}
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/10 mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-bold text-lg mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                  ❌ The Old Way (Traditional)
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 dark:text-red-400 mt-0.5">
                      •
                    </span>
                    <span>Wait 6–12 months for a specialist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 dark:text-red-400 mt-0.5">
                      •
                    </span>
                    <span>Pay $1,500–$3,000 per evaluation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 dark:text-red-400 mt-0.5">
                      •
                    </span>
                    <span>Only get a one-time snapshot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 dark:text-red-400 mt-0.5">
                      •
                    </span>
                    <span>No ongoing tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 dark:text-red-400 mt-0.5">
                      •
                    </span>
                    <span>No school-ready updates</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-bold text-lg mb-4 text-green-600 dark:text-green-400 flex items-center gap-2">
                  ✅ The Smart Way (BehaviorIQ™ Membership)
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 dark:text-green-400 mt-0.5">
                      •
                    </span>
                    <span>1 fresh assessment every month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 dark:text-green-400 mt-0.5">
                      •
                    </span>
                    <span>Progress tracking graphs over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 dark:text-green-400 mt-0.5">
                      •
                    </span>
                    <span>School-ready PDF updates anytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 dark:text-green-400 mt-0.5">
                      •
                    </span>
                    <span>Complete parent resource library</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 dark:text-green-400 mt-0.5">
                      •
                    </span>
                    <span>Add conversational AI sessions for just $9 each</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 dark:text-green-400 mt-0.5">
                      •
                    </span>
                    <span>Cancel anytime</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offer & Pricing Section (Highlight Box) */}
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/20 mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <h4 className="font-bold text-2xl mb-4 text-primary">
                🔥 Limited-Time Offer
              </h4>
              <p className="text-lg mb-2">
                <span className="line-through text-muted-foreground">
                  Normally $29/month
                </span>
                <span className="font-bold text-2xl text-primary ml-2">
                  → First 3 months 50% off
                </span>
              </p>
              <p className="text-xl font-bold mb-4">
                That's just $14.50/month — less than 1% of the cost of a
                traditional evaluation.
              </p>

              <Button
                size="lg"
                className="text-lg px-8 mb-6"
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading ? "Processing..." : "👉 Upgrade My Membership Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="text-sm text-muted-foreground space-y-1 mb-4">
                <p>✅ Cancel anytime</p>
                <p>✅ 30-day money-back guarantee</p>
                <p>✅ Keep all reports forever</p>
              </div>

              {/* Rejection Option (Gray Link at Bottom) */}
              <p className="text-sm">
                <Link
                  href="/dashboard"
                  className="text-gray-500 dark:text-gray-400 hover:underline hover:text-gray-600 dark:hover:text-gray-300"
                >
                  No thanks, I'll just keep my single report
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Thank you note */}
        <div className="text-center mt-8 p-6 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">
            Thank you for trusting AI Diagnostic with{" "}
            {childName ? `${childName}'s` : "your child's"}
            behavioral assessment. We're committed to providing you with
            valuable insights to support your family's journey.
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentSuccessWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

export default function PaymentSuccessPage() {
  return <PaymentSuccessWithSuspense />;
}
