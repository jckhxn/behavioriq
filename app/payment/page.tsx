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
import { Brain, CreditCard, Shield, CheckCircle, Star } from "lucide-react";
import { Suspense } from "react";
import { useUser } from "@/lib/hooks/use-supabase-user";

type PricingPlan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
};

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "BASIC",
    name: "Basic Report",
    price: 29.99,
    description: "Single comprehensive assessment report",
    features: [
      "Detailed behavioral analysis with visual charts",
      "Personalized AI-powered recommendations",
      "Professional-grade PDF download",
      "Resource library access (90 days)",
      "Next steps guidance",
    ],
  },
  {
    id: "PREMIUM",
    name: "Premium Package",
    price: 49.99,
    description: "Up to 5 assessments with advanced features",
    features: [
      "Everything in Basic",
      "Up to 5 assessment reports",
      "Advanced analytics and trends",
      "Priority email support",
      "Extended resource access (1 year)",
      "Custom recommendations",
      "Family comparison charts",
    ],
    popular: true,
  },
  {
    id: "UNLIMITED",
    name: "Unlimited Access",
    price: 99.99,
    description: "Unlimited assessments for the whole family",
    features: [
      "Everything in Premium",
      "Unlimited assessment reports",
      "Multi-child tracking dashboard",
      "Educational milestone tracking",
      "Phone consultation (30 min)",
      "Lifetime access to resources",
      "Priority customer support",
    ],
  },
];

function PaymentForm() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [childName, setChildName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const childNameParam = searchParams.get("childName");
    if (childNameParam) {
      setChildName(decodeURIComponent(childNameParam));
    }
  }, [searchParams]);

  const handlePayment = async (planId: string) => {
    if (!user) {
      window.location.href = "/login?redirect=/payment";
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          childName,
          planType: "ONE_TIME",
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-xl gradient-primary">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AI Diagnostic</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Get {childName ? `${childName}'s` : "the"} comprehensive assessment
            report
          </p>
          <Badge variant="secondary" className="mt-2">
            Step 2 of 2
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    one-time
                  </span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePayment(plan.id)}
                  disabled={isProcessing}
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Get {plan.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

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

        <div className="text-center text-xs text-muted-foreground mt-4">
          By completing your purchase, you agree to our Terms of Service and
          Privacy Policy. 30-day money-back guarantee.
        </div>

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
