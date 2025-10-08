"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MFAVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Get the MFA factor that needs verification
    const checkMFAStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Get the TOTP factor
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.find((f) => f.status === "verified");

      if (!totpFactor) {
        // No MFA set up, redirect to dashboard
        router.push(redirectTo);
        return;
      }

      setFactorId(totpFactor.id);
    };

    checkMFAStatus();
  }, [supabase, router, redirectTo]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    if (!factorId) {
      setError("MFA factor not found");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Create a challenge
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) throw challengeError;

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        setError("Invalid verification code. Please try again.");
        setIsVerifying(false);
        return;
      }

      toast.success("MFA verification successful");
      router.push(redirectTo);
    } catch (err) {
      console.error("MFA verification error:", err);
      setError("Failed to verify MFA code. Please try again.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) {
                    setCode(value);
                  }
                }}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                autoComplete="off"
                autoFocus
                disabled={isVerifying}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifying || code.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/login")}
                disabled={isVerifying}
              >
                Back to login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
