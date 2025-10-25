"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="text-lg font-medium">Signing you in...</div>
        <div className="text-sm text-muted-foreground">Please wait</div>
      </div>
    </div>
  );
}

function AutoLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const handleAutoLogin = async () => {
      // Check sessionStorage to prevent duplicate execution across StrictMode renders
      const storageKey = `auto-login-${token}`;
      if (hasRun || sessionStorage.getItem(storageKey)) return;

      setHasRun(true);
      sessionStorage.setItem(storageKey, "true");

      if (!token) {
        setError("No login token provided");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      try {
        // Exchange login token for session via API
        const response = await fetch("/api/auth/login-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Invalid login token");
        }

        const data = await response.json();

        // Clean up the flag after successful login
        setTimeout(() => sessionStorage.removeItem(storageKey), 5000);

        // Sign in with the temporary password
        if (data.tempPassword && data.user) {
          const supabase = createClient();

          // Check if already signed in
          const { data: { session: existingSession } } = await supabase.auth.getSession();

          if (existingSession?.user?.email === data.user.email) {
            console.log("✅ Already signed in:", data.user.email);
          } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: data.user.email,
              password: data.tempPassword,
            });

            if (signInError) {
              // Check if we're already signed in despite the error
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession?.user?.email === data.user.email) {
                console.log("✅ Session already established:", data.user.email);
              } else {
                console.error("Failed to sign in:", signInError);
                // Don't throw - token might be consumed by duplicate request
              }
            } else {
              console.log("✅ Session established for:", data.user.email);
            }
          }
        }

        // Redirect to dashboard
        const redirectTo = searchParams.get("redirect") || "/dashboard";
        console.log("[AutoLogin] Session established, redirecting to:", redirectTo);
        router.refresh();
        router.push(redirectTo);
      } catch (err) {
        console.error("Auto-login error:", err);
        setError(err instanceof Error ? err.message : "Login failed");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleAutoLogin();
  }, [token, router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg">{error}</div>
          <div className="text-sm text-muted-foreground">
            Redirecting to login...
          </div>
        </div>
      </div>
    );
  }

  return <LoadingState />;
}

export default function AutoLoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AutoLoginContent />
    </Suspense>
  );
}
