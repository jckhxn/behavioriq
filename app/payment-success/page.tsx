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

  useEffect(() => {
    const childNameParam = searchParams.get("childName");
    if (childNameParam) {
      setChildName(decodeURIComponent(childNameParam));
    }
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

        {/* Success Card */}
        <Card className="border-green-200 bg-green-50/50 mb-8">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800 mb-2">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-green-700 text-lg">
              Thank you for your purchase.{" "}
              {childName ? `${childName}'s` : "The"} full AI assessment report
              is now being generated with cited recommendations.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* What's Next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
            <CardDescription>
              You now have instant access to your assessment dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-medium text-primary">1</span>
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    Immediate: Email Confirmation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a confirmation email with your order details
                    and account login information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-medium text-primary">2</span>
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    Within 24 hours: AI Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Our AI system will analyze{" "}
                    {childName ? `${childName}'s` : "the"} assessment responses
                    and generate personalized recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-medium text-primary">3</span>
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    Instant Access: Full Assessment Dashboard
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your comprehensive assessment dashboard is now available in
                    your account with detailed analysis and recommendations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Access */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Access Your Account
            </CardTitle>
            <CardDescription>
              You can track your report status and access resources anytime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your account has been created and you now have access to:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Assessment history and results</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Resource library (90-day access)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Progress tracking tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Additional assessment options</span>
                </li>
              </ul>

              <div className="pt-4">
                <Button asChild className="w-full md:w-auto">
                  <Link href="/login">
                    Access Your Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our support team is here to help you every step of the way.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Email Support</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Get help via email within 24 hours
                  </p>
                  <a
                    href="mailto:support@aidiagnostic.com"
                    className="text-primary hover:underline text-sm"
                  >
                    support@aidiagnostic.com
                  </a>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Knowledge Base</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Find answers to common questions
                  </p>
                  <Link
                    href="/help"
                    className="text-primary hover:underline text-sm"
                  >
                    Browse Help Articles
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Upgrade Offer - Hormozi Style Upsell */}
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/10 mb-8">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">
              🎉 Congratulations! You've Just Saved Your Family $1,000s
            </CardTitle>
            <CardDescription className="text-lg">
              But wait... I have something even better for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-lg font-medium mb-4">
                  Since you just experienced the power of our AI assessment
                  system...
                </p>
                <p className="text-muted-foreground mb-6">
                  What if I told you there's a way to get UNLIMITED assessments,
                  track progress over time, and receive ongoing AI insights for
                  less than the cost of ONE traditional consultation?
                </p>
              </div>

              <div className="bg-white/50 dark:bg-black/20 p-6 rounded-lg border">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-lg mb-3 text-red-600">
                      ❌ Traditional Route (What Most Parents Do)
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Wait 3-6 months for specialist appointment</li>
                      <li>• Pay $300-500 per session</li>
                      <li>• Limited to specific timeframes</li>
                      <li>• One-time snapshot only</li>
                      <li>• No progress tracking</li>
                      <li>• No school-ready documentation</li>
                    </ul>
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded">
                      <p className="font-bold text-red-700 dark:text-red-400">
                        Total Cost: $2,000-5,000+ per year
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-3 text-green-600">
                      ✅ Our Monthly Membership (Smart Parents Choose This)
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• 1 fresh assessment report every month</li>
                      <li>• Progress tracking graphs over time</li>
                      <li>• School-ready updates anytime</li>
                      <li>• Complete parent resource library</li>
                      <li>• Identify changes before they become problems</li>
                      <li>• Add conversational AI sessions for $9 each</li>
                    </ul>
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded">
                      <p className="font-bold text-green-700 dark:text-green-400">
                        Your Cost: Just $29/month
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
                <h4 className="font-bold text-xl mb-2">
                  Limited Time: 50% OFF Your First 3 Months
                </h4>
                <p className="text-lg mb-1">
                  <span className="line-through text-muted-foreground">
                    $87.00
                  </span>
                  <span className="font-bold text-primary ml-2">
                    Just $43.50
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  That's less than what you'd pay for ONE hour with a
                  traditional specialist
                </p>

                <Button
                  size="lg"
                  className="text-lg px-8 mb-4"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading
                    ? "Processing..."
                    : "Yes! Upgrade to Membership for $14.50/month"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✅ Cancel anytime</p>
                  <p>✅ 30-day money-back guarantee</p>
                  <p>✅ Keep all your reports forever</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  This offer expires in 24 hours and won't be available at this
                  price again.
                </p>
                <p className="text-xs text-muted-foreground">
                  <Link
                    href="/dashboard"
                    className="text-primary hover:underline"
                  >
                    No thanks, I'll just use my single report
                  </Link>
                </p>
              </div>
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
            <p className="text-muted-foreground">Loading...</p>
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
