"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

export function MFASettings() {
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState<string>("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [factorId, setFactorId] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.[0];

        if (totpFactor && totpFactor.status === "verified") {
          setIsMFAEnabled(true);
          setFactorId(totpFactor.id);
        }
      }
    } catch (error) {
      console.error("Error checking MFA status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const enrollMFA = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) throw error;

      // Generate QR code from the URI
      const qrCodeUrl = await QRCode.toDataURL(data.totp.uri);
      setQrCode(qrCodeUrl);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setIsEnrolling(true);

      toast.success("Scan the QR code with your authenticator app");
    } catch (error: any) {
      toast.error(`Failed to set up 2FA: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnableMFA = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });

      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) throw verify.error;

      setIsMFAEnabled(true);
      setIsEnrolling(false);
      setQrCode("");
      setSecret("");
      setVerifyCode("");

      toast.success(
        "2FA enabled successfully! Your account is now more secure."
      );
    } catch (error: any) {
      toast.error(`Invalid verification code: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFA = async () => {
    if (
      !confirm(
        "Are you sure you want to disable two-factor authentication? This will make your account less secure."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;

      setIsMFAEnabled(false);
      setFactorId("");
      toast.success("2FA disabled successfully");
    } catch (error: any) {
      toast.error(`Failed to disable 2FA: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Secret key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isCheckingStatus) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 animate-pulse text-primary" />
            <CardTitle className="text-sm">Checking 2FA status...</CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">
            Two-Factor Authentication (2FA)
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Add an extra layer of security with time-based one-time passwords
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isMFAEnabled && !isEnrolling && (
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                Your account is not protected by 2FA. Enable it to secure your
                account.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                You'll need an authenticator app like Google Authenticator,
                Microsoft Authenticator, Authy, or 1Password.
              </p>
            </div>

            <Button
              onClick={enrollMFA}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              <Smartphone className="mr-2 h-3 w-3" />
              {isLoading ? "Setting up..." : "Enable Two-Factor Authentication"}
            </Button>
          </div>
        )}

        {isEnrolling && (
          <div className="space-y-3">
            <Alert>
              <Smartphone className="h-3 w-3" />
              <AlertDescription className="text-xs">
                Scan this QR code with your authenticator app, then enter the
                code to verify.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center space-y-3">
              {qrCode && (
                <div className="p-3 bg-white rounded-lg border">
                  <img src={qrCode} alt="2FA QR Code" className="w-32 h-32" />
                </div>
              )}

              <div className="w-full space-y-1">
                <Label className="text-xs font-medium">
                  Or enter this code manually:
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={secret}
                    readOnly
                    className="h-8 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySecret}
                    disabled={copied}
                    className="h-8 w-8 p-0"
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="verify-code" className="text-xs">
                Enter verification code
              </Label>
              <Input
                id="verify-code"
                placeholder="000000"
                value={verifyCode}
                onChange={(e) =>
                  setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                className="h-8 text-center text-lg tracking-widest font-mono"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={verifyAndEnableMFA}
                disabled={isLoading || verifyCode.length !== 6}
                size="sm"
                className="flex-1"
              >
                {isLoading ? "Verifying..." : "Verify & Enable"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEnrolling(false);
                  setQrCode("");
                  setSecret("");
                  setVerifyCode("");
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isMFAEnabled && (
          <div className="space-y-3">
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-xs text-green-900 dark:text-green-100">
                Two-factor authentication is enabled and protecting your account
              </AlertDescription>
            </Alert>

            <p className="text-xs text-muted-foreground">
              You'll be asked for a code from your authenticator app each time
              you sign in.
            </p>

            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={disableMFA}
              disabled={isLoading}
            >
              {isLoading ? "Disabling..." : "Disable Two-Factor Authentication"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
