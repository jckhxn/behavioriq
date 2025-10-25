"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { attributeSignupToAffiliate } from "@/lib/affiliate/onboarding";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // Get the code from URL (including hash params)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const searchParams = new URLSearchParams(window.location.search);

        // Check for errors first
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (errorParam) {
          console.error("Auth error:", errorParam, errorDescription);
          setError(errorDescription || "Authentication failed");
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        // Supabase automatically handles the code exchange on client side
        // Just need to check if we have a session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(sessionError.message);
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        if (session) {
          console.log("✅ Session established:", session.user.email);

          // Attribute signup to affiliate if user came from referral link
          await attributeSignupToAffiliate(session.user.id);

          // Check if this is a password reset flow
          const type = searchParams.get("type");
          if (type === "recovery" || type === "invite") {
            router.push("/auth/reset-password");
          } else {
            // Regular login - redirect to dashboard
            router.push("/dashboard");
          }
        } else {
          // No session yet, might still be processing
          console.log("No session found after callback");

          // Listen for auth state changes
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((event, newSession) => {
            console.log("Auth state changed:", event, newSession?.user?.email);
            if (newSession) {
              subscription.unsubscribe();

              // Attribute signup to affiliate if user came from referral link
              attributeSignupToAffiliate(newSession.user.id).then(() => {
                const type = searchParams.get("type");
                if (type === "recovery" || type === "invite") {
                  router.push("/auth/reset-password");
                } else {
                  router.push("/dashboard");
                }
              });
            }
          });

          // Give it a few seconds to process
          setTimeout(() => {
            setError(
              "Authentication link may have expired. Please request a new one."
            );
          }, 3000);
        }
      } catch (err: any) {
        console.error("Callback error:", err);
        setError(err.message || "An error occurred");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {error ? "Authentication Error" : "Completing Sign In..."}
          </CardTitle>
          <CardDescription>
            {error ? error : "Please wait while we sign you in."}
          </CardDescription>
        </CardHeader>
        {!error && (
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
