"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Check,
} from "lucide-react";
import { toast } from "sonner";

function TrialCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [childName, setChildName] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const childNameParam = searchParams.get("childName");
    if (childNameParam) {
      setChildName(decodeURIComponent(childNameParam));
    }
  }, [searchParams]);

  // If user is already logged in, redirect to direct checkout
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const params = new URLSearchParams();
      if (childName) {
        params.set("childName", childName);
      }
      router.push(`/checkout-direct?${params.toString()}`);
    }
  }, [status, session, childName, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsProcessing(true);

    try {
      // Create checkout session with user data
      const userData = {
        email,
        name,
        password,
      };

      const response = await fetch("/api/stripe/checkout-anonymous", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData,
          plan: "BASIC",
          childName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process checkout"
      );
      setIsProcessing(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 mb-4">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Get Your Full AI Assessment Report
            </h1>
            <p className="text-muted-foreground text-lg">
              Create your account and proceed to payment
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Full AI Assessment Report</h3>
                    <p className="text-sm text-muted-foreground">
                      {childName
                        ? `Assessment for ${childName}`
                        : "Comprehensive behavioral assessment"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">$97.00</div>
                    <div className="text-sm text-muted-foreground">
                      one-time
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>$97.00</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    What's Included:
                  </h4>
                  <ul className="text-sm space-y-1.5 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>30-50 question comprehensive assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>AI-generated professional report</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Personalized recommendations with sources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>School-ready PDF format</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Instant access after payment</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-center">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    🎉 30-Day Money-Back Guarantee
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Creation Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>
                  Your account will be created after successful payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isProcessing}
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isProcessing}
                        minLength={8}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue to Payment
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                  </p>

                  <div className="text-center pt-2">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <a
                        href={`/login?redirect=/checkout-direct${childName ? `?childName=${encodeURIComponent(childName)}` : ""}`}
                        className="text-primary hover:underline"
                      >
                        Log in
                      </a>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Security Badges */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Secure payment processing powered by Stripe
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                SSL Encrypted
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Lock className="h-4 w-4" />
                PCI Compliant
              </div>
              <span>•</span>
              <div>Money-Back Guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrialCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <TrialCheckoutContent />
    </Suspense>
  );
}
