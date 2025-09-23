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
import { Badge } from "@/components/ui/badge";
import { Brain, CreditCard, Shield, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function PaymentForm() {
  const searchParams = useSearchParams();
  const [childName, setChildName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const childNameParam = searchParams.get("childName");
    if (childNameParam) {
      setChildName(decodeURIComponent(childNameParam));
    }
  }, [searchParams]);

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Redirect to success page or dashboard
      window.location.href =
        "/payment-success?childName=" + encodeURIComponent(childName);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-xl gradient-primary">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AI Diagnostic</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Order</h1>
          <p className="text-muted-foreground">
            Final step to get {childName ? `${childName}'s` : "the"}{" "}
            comprehensive report
          </p>
          <Badge variant="secondary" className="mt-2">
            Step 2 of 2
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Your comprehensive behavioral assessment report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span>Comprehensive Assessment Report</span>
                <span className="font-medium">$29.00</span>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-medium">Includes:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Detailed behavioral analysis with visual charts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Personalized AI-powered recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Professional-grade PDF download</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Resource library access (90 days)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Next steps guidance</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center font-medium text-lg">
                  <span>Total</span>
                  <span>$29.00</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Clock className="h-4 w-4" />
                <span>Instant dashboard access</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Secure payment powered by Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Placeholder for Stripe payment form */}
              <div className="space-y-4">
                <div className="p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center bg-muted/30">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">
                    Stripe Payment Integration
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    In production, this would be the Stripe payment form
                  </p>

                  {/* Demo payment button */}
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay $29.00 (Demo)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Security badges */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>SSL Encrypted</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>PCI Compliant</span>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                By completing your purchase, you agree to our Terms of Service
                and Privacy Policy. 30-day money-back guarantee.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@aidiagnostic.com"
              className="text-primary hover:underline"
            >
              support@aidiagnostic.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentPageWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payment form...</p>
          </div>
        </div>
      }
    >
      <PaymentForm />
    </Suspense>
  );
}

export default function PaymentPage() {
  return <PaymentPageWithSuspense />;
}
