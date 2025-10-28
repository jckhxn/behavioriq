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

          // Create user in database if they don't exist yet
          try {
            const createUserResponse = await fetch("/api/auth/create-user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email,
              }),
            });

            if (createUserResponse.ok) {
              console.log("✅ User created in database");
            } else {
              console.warn(
                "Failed to create user in database:",
                createUserResponse.status
              );
              // Non-fatal error - user may already exist
            }
          } catch (createUserError) {
            console.error("Error creating user in database:", createUserError);
            // Non-fatal error - user may already exist
          }

          // Attribute signup to affiliate if user came from referral link
          await attributeSignupToAffiliate(session.user.id);

          // Check if there's a pending assessment to link
          const pendingAssessmentId =
            typeof window !== "undefined"
              ? localStorage.getItem("pendingAssessmentId")
              : null;
          if (pendingAssessmentId) {
            try {
              console.log("Linking assessment:", pendingAssessmentId);
              const linkResponse = await fetch("/api/assessment/link-to-user", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ assessmentId: pendingAssessmentId }),
              });

              if (linkResponse.ok) {
                console.log("✅ Assessment linked successfully");
                // Clear the pending assessmentId from localStorage
                localStorage.removeItem("pendingAssessmentId");
              } else {
                console.warn(
                  "Assessment linking failed:",
                  linkResponse.status
                );
                // Non-fatal error - user is authenticated, continue
              }
            } catch (linkError) {
              console.error("Error linking assessment:", linkError);
              // Non-fatal error - user is authenticated, continue
            }
          }

          // Refresh to sync session to server before navigation
          router.refresh();

          // Check if this is a password reset flow
          const type = searchParams.get("type");
          if (type === "recovery" || type === "invite") {
            router.push("/auth/reset-password");
          } else if (pendingAssessmentId) {
            // If we had a pending assessment, redirect to it to show results
            router.push(`/assessment/${pendingAssessmentId}`);
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

              // Create user in database if they don't exist yet
              fetch("/api/auth/create-user", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: newSession.user.id,
                  email: newSession.user.email,
                  name:
                    newSession.user.user_metadata?.name ||
                    newSession.user.email,
                }),
              })
                .then((res) => {
                  if (res.ok) {
                    console.log("✅ User created in database");
                  } else {
                    console.warn(
                      "Failed to create user in database:",
                      res.status
                    );
                  }
                })
                .catch((err) => {
                  console.error("Error creating user in database:", err);
                });

              // Attribute signup to affiliate if user came from referral link
              attributeSignupToAffiliate(newSession.user.id).then(async () => {
                // Check if there's a pending assessment to link
                const pendingAssessmentId =
                  typeof window !== "undefined"
                    ? localStorage.getItem("pendingAssessmentId")
                    : null;
                if (pendingAssessmentId) {
                  try {
                    console.log("Linking assessment:", pendingAssessmentId);
                    const linkResponse = await fetch(
                      "/api/assessment/link-to-user",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          assessmentId: pendingAssessmentId,
                        }),
                      }
                    );

                    if (linkResponse.ok) {
                      console.log("✅ Assessment linked successfully");
                      // Clear the pending assessmentId from localStorage
                      localStorage.removeItem("pendingAssessmentId");
                    } else {
                      console.warn(
                        "Assessment linking failed:",
                        linkResponse.status
                      );
                    }
                  } catch (linkError) {
                    console.error("Error linking assessment:", linkError);
                  }
                }

                // Refresh to sync session to server before navigation
                router.refresh();
                const type = searchParams.get("type");
                if (type === "recovery" || type === "invite") {
                  router.push("/auth/reset-password");
                } else if (pendingAssessmentId) {
                  // If we had a pending assessment, redirect to it to show results
                  router.push(`/assessment/${pendingAssessmentId}`);
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
