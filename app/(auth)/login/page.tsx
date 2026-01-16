"use client";

import { useState, Suspense } from "react";
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
import { Eye, EyeOff, Mail, Fingerprint, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  SUPABASE_STORAGE_PREFERENCE_KEY,
  createClient,
} from "@/lib/supabase/client";
import { OAuthProviders } from "@/components/auth/OAuthProviders";
import { startAuthentication } from "@simplewebauthn/browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [mfaCode, setMfaCode] = useState("");

  const from = searchParams.get("from") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (typeof window !== "undefined") {
        try {
          // Route Supabase auth storage based on the "Remember Me" selection
          // IMPORTANT: Clear the storage that WON'T be used to prevent session mixing
          if (rememberMe) {
            window.localStorage.setItem(
              SUPABASE_STORAGE_PREFERENCE_KEY,
              "local"
            );
            window.sessionStorage.removeItem(SUPABASE_STORAGE_PREFERENCE_KEY);
            // Clear sessionStorage auth token since we're using localStorage
            try {
              window.sessionStorage.removeItem("sb-auth-token");
            } catch {
              // Ignore
            }
          } else {
            window.sessionStorage.setItem(
              SUPABASE_STORAGE_PREFERENCE_KEY,
              "session"
            );
            window.localStorage.removeItem(SUPABASE_STORAGE_PREFERENCE_KEY);
            // Clear localStorage auth token since we're using sessionStorage
            try {
              window.localStorage.removeItem("sb-auth-token");
            } catch {
              // Ignore
            }
          }
        } catch {
          // Ignore storage preference errors (e.g., disabled storage)
        }
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Invalid email or password");
        return;
      }

      // CRITICAL: Verify session is available before navigating
      // This ensures tokens are synced to localStorage/sessionStorage before server receives the request
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session not established. Please try again.");
        console.error("[Login] No session after signin");
        return;
      }

      console.log("[Login] Session established for:", session.user.email);

      // Check if user has MFA enabled
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasMFA = factors?.totp?.some((f) => f.status === "verified");

      if (hasMFA) {
        // Redirect to MFA verification page
        toast.info("Please verify your two-factor authentication code");
        console.log(
          "[Login] MFA required, redirecting to:",
          `/mfa-verify?redirect=${encodeURIComponent(from)}`
        );
        // Wait a moment for middleware to sync cookies before redirecting
        await new Promise((resolve) => setTimeout(resolve, 300));
        router.refresh();
        router.push(`/mfa-verify?redirect=${encodeURIComponent(from)}`);
      } else {
        toast.success("Signed in successfully");
        console.log("[Login] No MFA, redirecting to:", from);
        // Wait a moment for middleware to sync cookies before redirecting
        // This ensures the auth cookie is set before the next page loads
        await new Promise((resolve) => setTimeout(resolve, 300));
        router.refresh();
        // Ensure we go to dashboard if from parameter is missing or is login page
        const redirectTo = from && from !== "/login" ? from : "/dashboard";
        console.log("[Login] Final redirect to:", redirectTo);
        router.push(redirectTo);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        setMagicLinkSent(true);
        toast.success("Check your email for the magic link!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    // Check WebAuthn support (Chrome 132+ on iOS, Safari 14+, Chrome/Edge on Android/Desktop)
    const isWebAuthnSupported =
      typeof window !== "undefined" &&
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential === "function";

    if (!isWebAuthnSupported) {
      toast.error(
        "Passkey login is not supported in this browser. Please use an updated browser that supports passkeys."
      );
      return;
    }
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get authentication options
      const optionsRes = await fetch("/api/auth/passkeys/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!optionsRes.ok) {
        const error = await optionsRes.json();
        throw new Error(
          error.error || "Failed to start passkey authentication"
        );
      }

      const options = await optionsRes.json();

      // 2. Start authentication with browser
      const credential = await startAuthentication(options);

      // 3. Verify with server
      const verifyRes = await fetch("/api/auth/passkeys/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, credential }),
      });

      if (!verifyRes.ok) {
        const error = await verifyRes.json();
        throw new Error(error.error || "Failed to verify passkey");
      }

      const { loginToken } = await verifyRes.json();

      // 4. Use login token to authenticate
      toast.success("Signed in with passkey!");
      router.push(`/auth/auto-login?token=${loginToken}`);
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        toast.error("Passkey authentication was cancelled");
      } else {
        toast.error(error.message || "Failed to sign in with passkey");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="username webauthn"
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
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-muted-foreground"
              >
                Remember me for 90 days
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleMagicLink}
                disabled={isLoading || magicLinkSent}
              >
                <Mail className="mr-2 h-4 w-4" />
                {magicLinkSent ? "Sent!" : "Magic link"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handlePasskeyLogin}
                disabled={isLoading}
              >
                <Fingerprint className="mr-2 h-4 w-4" />
                Passkey
              </Button>
            </div>

            {/* OAuth Providers */}
            <OAuthProviders />
          </form>

          <div className="mt-4 space-y-2 text-center text-sm">
            <div>
              <Link
                href="/auth/forgot-password"
                className="text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div>
              Want to try it first?{" "}
              <Link
                href="/trial-assessment"
                className="text-primary hover:underline"
              >
                Take a free trial
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
