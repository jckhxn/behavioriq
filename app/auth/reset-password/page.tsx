"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasMFA, setHasMFA] = useState(false);
  const [showMFAInput, setShowMFAInput] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [factorId, setFactorId] = useState<string>("");

  // Verify user has a valid recovery session
  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        setError(
          "Invalid or expired reset link. Please request a new password reset."
        );
        setVerifying(false);
        return;
      }

      // Check if user has MFA enabled
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const mfaEnabled = factors?.totp?.some((f) => f.status === "verified");
      setHasMFA(!!mfaEnabled);

      // Store the factor ID for MFA verification
      if (mfaEnabled && factors?.totp) {
        const verifiedFactor = factors.totp.find((f) => f.status === "verified");
        if (verifiedFactor) {
          setFactorId(verifiedFactor.id);
        }
      }

      setVerifying(false);
    }

    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // If user has MFA, verify the code first
      if (hasMFA && !showMFAInput) {
        // Show MFA input screen
        setShowMFAInput(true);
        setLoading(false);
        return;
      }

      // Verify MFA code if required
      if (hasMFA && mfaCode) {
        const { error: challengeError, data: challengeData } =
          await supabase.auth.mfa.challenge({ factorId });

        if (challengeError) {
          throw new Error(challengeError.message);
        }

        const { error: verifyError } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challengeData.id,
          code: mfaCode,
        });

        if (verifyError) {
          setError("Invalid MFA code. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Now update the password (AAL2 session established if MFA verified)
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verifying Reset Link...</CardTitle>
            <CardDescription>
              Please wait while we verify your password reset link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Password Updated!</CardTitle>
            <CardDescription>
              Your password has been successfully updated. Redirecting to
              dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
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
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {showMFAInput && (
              <>
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
                  <strong>Two-Factor Authentication Required</strong>
                  <p className="mt-1">
                    Enter the 6-digit code from your authenticator app to
                    verify your identity.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mfa-code">Authentication Code</Label>
                  <Input
                    id="mfa-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    required
                    autoFocus
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
              </>
            )}

            {hasMFA && !showMFAInput && (
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
                <strong>Note:</strong> You have two-factor authentication enabled.
                You'll need to verify with your authenticator app after entering
                your new password.
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Updating..."
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
