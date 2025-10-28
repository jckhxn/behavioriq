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
import { Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [hasCompletedTrial, setHasCompletedTrial] = useState<boolean | null>(
    null
  );
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  // Check if user has completed trial assessment OR has assessmentId from results page
  useEffect(() => {
    const checkTrialCompletion = () => {
      try {
        // Check if we have an assessmentId from the results page (comes from completed assessment)
        const urlAssessmentId = searchParams.get("assessmentId");
        if (urlAssessmentId) {
          setAssessmentId(urlAssessmentId);
          // Store assessmentId in localStorage so we can link it after password setup
          localStorage.setItem("pendingAssessmentId", urlAssessmentId);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Create user in Supabase Auth without password
      // Password will be set in the next step after email confirmation
      const { error } = await supabase.auth.signUp({
        email,
        password: "temporary-placeholder-password", // Temporary, user will set real password after email confirmation
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
        setAccountCreated(true);
        toast.success("Account created! Check your email to confirm.");
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
              Click the link in the email to confirm your email address. You'll then set up your password.
            </p>
            {assessmentId ? (
              <>
                <p className="text-sm text-muted-foreground">
                  After setting your password, your assessment results will be automatically linked to your account.
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
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
