"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  onAccountDeleted?: () => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  userEmail,
  onAccountDeleted,
}: DeleteAccountDialogProps) {
  const [step, setStep] = useState<"warning" | "confirm" | "password">("warning");
  const [password, setPassword] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [agreeToDelete, setAgreeToDelete] = useState(false);
  const [agreeToDataLoss, setAgreeToDataLoss] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const confirmationRequired = "PERMANENTLY_DELETE_MY_ACCOUNT";
  const isConfirmationCorrect = confirmationText === confirmationRequired;

  const handleInitiateDelete = () => {
    if (!agreeToDelete || !agreeToDataLoss) {
      setError("You must acknowledge both warnings to continue");
      return;
    }
    setError(null);
    setStep("confirm");
  };

  const handleSubmitPassword = async () => {
    if (!password) {
      setError("Password is required");
      return;
    }

    if (!isConfirmationCorrect) {
      setError("Confirmation text does not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          confirmation: confirmationRequired,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete account");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setStep("password");

      // Notify parent and close dialog
      setTimeout(() => {
        onAccountDeleted?.();
        onOpenChange(false);
        // Redirect to login after deletion
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError("An error occurred while deleting your account");
      console.error("Account deletion error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please read carefully.
          </DialogDescription>
        </DialogHeader>

        {step === "warning" && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Deleting your account will permanently
                remove all your data, including assessments, results, and
                settings.
              </AlertDescription>
            </Alert>

            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-4 space-y-3">
              <h4 className="font-semibold text-sm text-red-900 dark:text-red-200">
                What will be deleted:
              </h4>
              <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>All assessments and results</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>All child profiles and their data</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>All payment history and billing information</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>All shared assessment links</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Your profile and settings</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agree-delete"
                  checked={agreeToDelete}
                  onCheckedChange={(checked) =>
                    setAgreeToDelete(checked as boolean)
                  }
                />
                <Label
                  htmlFor="agree-delete"
                  className="text-sm cursor-pointer font-normal"
                >
                  I understand all my data will be permanently deleted
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agree-data-loss"
                  checked={agreeToDataLoss}
                  onCheckedChange={(checked) =>
                    setAgreeToDataLoss(checked as boolean)
                  }
                />
                <Label
                  htmlFor="agree-data-loss"
                  className="text-sm cursor-pointer font-normal"
                >
                  I agree to permanently lose access to all my assessments
                </Label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInitiateDelete}
                variant="destructive"
                className="flex-1"
                disabled={!agreeToDelete || !agreeToDataLoss}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Final confirmation required:</strong> Please enter your
                password and type the confirmation text to proceed.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type the following to confirm:{" "}
                <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs font-mono">
                  {confirmationRequired}
                </code>
              </Label>
              <Input
                id="confirmation"
                type="text"
                placeholder={confirmationRequired}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                disabled={loading}
              />
            </div>

            {isConfirmationCorrect && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Confirmation text matches</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setStep("warning")}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmitPassword}
                variant="destructive"
                className="flex-1"
                disabled={loading || !password || !isConfirmationCorrect}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete My Account"
                )}
              </Button>
            </div>
          </div>
        )}

        {success && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                <strong>Account deletion initiated.</strong> Your account and all
                associated data will be permanently removed. You will be
                redirected shortly.
              </AlertDescription>
            </Alert>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Thank you for using BehaviorIQ. We're sorry to see you go.
            </p>

            <Button className="w-full" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redirecting...
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
