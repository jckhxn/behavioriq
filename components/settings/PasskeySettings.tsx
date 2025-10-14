"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Fingerprint,
  Smartphone,
  Laptop,
  Trash2,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { startRegistration } from "@simplewebauthn/browser";

interface Passkey {
  id: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
}

export function PasskeySettings() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if WebAuthn is supported
    const supported =
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential === "function";
    setIsSupported(supported);

    if (supported) {
      loadPasskeys();
    }
  }, []);

  const loadPasskeys = async () => {
    try {
      const response = await fetch("/api/auth/passkeys");
      if (response.ok) {
        const data = await response.json();
        setPasskeys(data.passkeys || []);
      }
    } catch (error) {
      console.error("Failed to load passkeys:", error);
    }
  };

  const registerPasskey = async () => {
    try {
      setIsLoading(true);

      // Get registration options from server
      const optionsResponse = await fetch("/api/auth/passkeys/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(
          errorData.error || "Failed to get registration options"
        );
      }

      const options = await optionsResponse.json();

      // Validate options structure
      if (!options || typeof options !== "object" || !options.challenge) {
        console.error("Invalid options received:", options);
        throw new Error("Invalid registration options from server");
      }

      // Ensure all required fields are present and properly formatted
      const validatedOptions = {
        ...options,
        challenge: options.challenge,
        rp: {
          name: options.rp?.name || "AI Diagnostic",
          id: options.rp?.id || window.location.hostname,
        },
        user: {
          id: options.user?.id || "",
          name: options.user?.name || "",
          displayName: options.user?.displayName || "",
        },
        pubKeyCredParams: options.pubKeyCredParams || [
          { alg: -7, type: "public-key" },    // ES256
          { alg: -257, type: "public-key" },  // RS256
        ],
        timeout: options.timeout || 60000,
        attestation: options.attestation || "none",
        // Mobile-friendly settings: allow platform authenticators (Face ID, Touch ID, biometrics)
        authenticatorSelection: options.authenticatorSelection || {
          residentKey: "preferred",      // Allow discoverable credentials
          userVerification: "preferred", // Use biometrics when available
          requireResidentKey: false,     // Don't require it for better compatibility
        },
      };

      // Start registration with the browser's WebAuthn API
      const credential = await startRegistration(validatedOptions);

      // Prompt for passkey name
      const passkeyName = prompt(
        "Give this passkey a name (e.g., 'MacBook Touch ID', 'YubiKey'):",
        `${navigator.userAgent.includes("Mac") ? "Mac" : "Device"} ${new Date().toLocaleDateString()}`
      );

      if (!passkeyName) {
        toast.error("Passkey name is required");
        return;
      }

      // Verify registration with server
      const verifyResponse = await fetch("/api/auth/passkeys/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential,
          name: passkeyName.trim(),
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || "Failed to verify passkey");
      }

      toast.success("Passkey registered successfully!");
      await loadPasskeys();
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        toast.error("Passkey registration was cancelled");
      } else {
        toast.error(`Failed to register passkey: ${error.message}`);
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePasskey = async (passkeyId: string) => {
    if (!confirm("Are you sure you want to remove this passkey?")) {
      return;
    }

    try {
      const response = await fetch(`/api/auth/passkeys/${passkeyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete passkey");
      }

      toast.success("Passkey removed successfully");
      await loadPasskeys();
    } catch (error: any) {
      toast.error(`Failed to remove passkey: ${error.message}`);
    }
  };

  const getDeviceIcon = (name: string) => {
    if (name.toLowerCase().includes("phone")) return Smartphone;
    if (
      name.toLowerCase().includes("laptop") ||
      name.toLowerCase().includes("computer") ||
      name.toLowerCase().includes("device")
    )
      return Laptop;
    return Fingerprint;
  };

  if (!isSupported) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Passkeys & Biometrics</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Sign in quickly and securely with your device's biometrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription className="text-xs">
              Your browser doesn't support passkeys. Please use a modern browser
              like Chrome, Safari, or Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Passkeys & Biometrics</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Use your fingerprint, face, or security key to sign in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Passkeys are a safer and easier alternative to passwords:
          </p>
          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
            <li>Face ID or Touch ID (iPhone/iPad/Mac)</li>
            <li>Windows Hello (PC)</li>
            <li>Fingerprint scanner (Android)</li>
            <li>Hardware security keys (YubiKey, etc.)</li>
          </ul>
        </div>

        {passkeys.length === 0 ? (
          <Alert>
            <Fingerprint className="h-3 w-3" />
            <AlertDescription className="text-xs">
              You don't have any passkeys set up. Add one to enable quick and
              secure sign-in.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium">Your Passkeys</p>
            <div className="space-y-2">
              {passkeys.map((passkey) => {
                const Icon = getDeviceIcon(passkey.name);
                return (
                  <div
                    key={passkey.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">{passkey.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Added{" "}
                          {new Date(passkey.createdAt).toLocaleDateString()}
                          {passkey.lastUsed &&
                            ` • Last used ${new Date(passkey.lastUsed).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePasskey(passkey.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Button
          onClick={registerPasskey}
          disabled={isLoading}
          size="sm"
          className="w-full"
        >
          <Plus className="mr-2 h-3 w-3" />
          {isLoading ? "Registering..." : "Add Passkey"}
        </Button>

        {passkeys.length > 0 && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-xs text-green-900 dark:text-green-100">
              Your account is protected by {passkeys.length} passkey
              {passkeys.length > 1 ? "s" : ""}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
