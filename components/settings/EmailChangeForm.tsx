"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailChangeFormProps {
  currentEmail: string;
  onEmailChanged?: () => void;
}

export function EmailChangeForm({
  currentEmail,
  onEmailChanged,
}: EmailChangeFormProps) {
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "confirmation">("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Call verify-email endpoint
      const response = await fetch("/api/user/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send verification email");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setPendingEmail(newEmail);
      setStep("confirmation");
      setNewEmail("");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Email change error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setError(null);
    setPendingEmail(null);
    setStep("form");
    setNewEmail("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Change Email Address
        </CardTitle>
        <CardDescription>
          Update your email address and verify ownership
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Email</Label>
              <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border">
                {currentEmail}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="your-new-email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400">
              A verification email will be sent to your new email address. You
              must verify it within 24 hours to complete the change.
            </p>

            <Button
              type="submit"
              disabled={loading || !newEmail}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending verification email...
                </>
              ) : (
                "Send Verification Email"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {success && (
              <>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Verification email sent!</strong>
                    <p className="mt-2">
                      A verification link has been sent to{" "}
                      <span className="font-semibold">{pendingEmail}</span>
                    </p>
                    <p className="mt-2 text-sm">
                      Click the link in the email to confirm your new email
                      address. The link will expire in 24 hours.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 space-y-2">
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-200">
                    What happens next:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li className="flex gap-2">
                      <span>1.</span>
                      <span>Check your email for the verification link</span>
                    </li>
                    <li className="flex gap-2">
                      <span>2.</span>
                      <span>Click the link to verify your new email</span>
                    </li>
                    <li className="flex gap-2">
                      <span>3.</span>
                      <span>Your email will be updated immediately</span>
                    </li>
                    <li className="flex gap-2">
                      <span>4.</span>
                      <span>
                        If you don't verify within 24 hours, the change will be
                        cancelled
                      </span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                >
                  Change Another Email
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
