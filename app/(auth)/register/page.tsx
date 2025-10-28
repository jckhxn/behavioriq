"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Eye, EyeOff, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkingAssessment, setIsLinkingAssessment] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [hasCompletedTrial, setHasCompletedTrial] = useState<boolean | null>(
    null
  );
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  const from = searchParams.get("from") || "/dashboard";

  // Check if user has completed trial assessment OR has assessmentId from results page
  useEffect(() => {
    const checkTrialCompletion = () => {
      try {
        // Check if we have an assessmentId from the results page (comes from completed assessment)
        const urlAssessmentId = searchParams.get("assessmentId");
        if (urlAssessmentId) {
          setAssessmentId(urlAssessmentId);
          setHasCompletedTrial(true); // Mark as completed since they came from assessment
          return;
        }

        // Check localStorage for trial completion flag from standard trial flow
        const trialCompleted = localStorage.getItem("trial_completed");
        if (trialCompleted === "true") {
          setHasCompletedTrial(true);
          return;
        }

        // No trial completed and no assessment - require trial completion
        // After a short delay, redirect to trial assessment
        setHasCompletedTrial(false);
        setTimeout(() => {
          router.push("/trial-assessment");
        }, 3000);
      } catch (error) {
        console.error("Error checking trial completion:", error);
        setHasCompletedTrial(false);
      }
    };

    checkTrialCompletion();
  }, [router, searchParams]);

  const linkAssessmentToUser = async () => {
    if (!assessmentId) return;

    setIsLinkingAssessment(true);
    try {
      const response = await fetch("/api/assessment/link-to-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assessmentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to link assessment:", error);
        // Non-fatal error - user is still registered
        toast.warning(
          "Account created but couldn't link assessment. You can access it from your dashboard."
        );
      } else {
        const data = await response.json();
        toast.success("Assessment linked to your account!");
      }
    } catch (error) {
      console.error("Error linking assessment:", error);
      // Non-fatal error - user is still registered
      toast.warning(
        "Account created but couldn't link assessment. You can access it from your dashboard."
      );
    } finally {
      setIsLinkingAssessment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Create user in Supabase Auth
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        // If we have an assessmentId, link it to the new user
        if (assessmentId) {
          await linkAssessmentToUser();
        }

        setAccountCreated(true);
        toast.success("Account created! Check your email to confirm.");

        // If they came from an assessment, redirect them there after confirmation
        if (assessmentId) {
          setTimeout(() => {
            router.push(`/assessment/${assessmentId}`);
          }, 3000);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking trial completion
  if (hasCompletedTrial === null) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Verifying access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if trial not completed (and no assessmentId)
  if (hasCompletedTrial === false) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete Trial Assessment First</CardTitle>
            <CardDescription>
              Please complete our free trial assessment before creating an
              account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Trial Required</AlertTitle>
              <AlertDescription>
                To create an account, you must first complete our free trial
                assessment. This helps us provide you with personalized
                recommendations.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the trial assessment...
            </p>
            <Button
              onClick={() => router.push("/trial-assessment")}
              className="w-full"
            >
              Start Trial Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accountCreated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a confirmation link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to confirm your account and start
              using AI Diagnostic.
            </p>
            {assessmentId ? (
              <>
                <p className="text-sm text-muted-foreground">
                  After confirming your email, you'll be redirected to view your
                  assessment results.
                </p>
              </>
            ) : null}
            <Button onClick={() => router.push("/login")} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            {assessmentId
              ? "Save your assessment results by creating an account"
              : "Sign up to access AI-powered behavioral assessments"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading || isLinkingAssessment}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isLinkingAssessment}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isLinkingAssessment}
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || isLinkingAssessment}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isLinkingAssessment}
            >
              {isLoading || isLinkingAssessment
                ? "Creating account..."
                : "Create account"}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm">
            <div>
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
            {!assessmentId && (
              <div>
                Want to try it first?{" "}
                <Link
                  href="/trial-assessment"
                  className="text-primary hover:underline"
                >
                  Take a free trial
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
