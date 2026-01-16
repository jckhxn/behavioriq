"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Chrome, Apple } from "lucide-react";
import { toast } from "sonner";

const providers = [
  { name: "google" as const, icon: Chrome, label: "Google" },
  { name: "apple" as const, icon: Apple, label: "Apple" },
];

export function OAuthProviders() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const supabase = createClient();

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setLoadingProvider(provider);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: provider === "google" ? "email profile" : undefined,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(`Failed to sign in with ${provider}: ${error.message}`);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {providers.map(({ name, icon: Icon, label }) => (
        <Button
          key={name}
          variant="outline"
          onClick={() => handleOAuthLogin(name)}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === name ? (
            <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
          ) : (
            <Icon className="mr-2 h-4 w-4" />
          )}
          {label}
        </Button>
      ))}
    </div>
  );
}
