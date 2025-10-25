"use client";

import { useEffect } from "react";
import { initializeGA4 } from "@/lib/analytics/ga4-service";
import { initializeSentry, setSentryUser } from "@/lib/integrations/sentry-service";
import { useUserData } from "@/lib/hooks/use-supabase-user";

/**
 * Analytics Initializer Component
 * Initializes GA4 and Sentry on client-side
 * Runs once per session
 */
export function AnalyticsInitializer() {
  const { userData } = useUserData();

  useEffect(() => {
    // Initialize GA4
    initializeGA4();

    // Initialize Sentry
    initializeSentry();

    // Set user context in Sentry if logged in
    if (userData?.id) {
      setSentryUser(userData.id, userData.email, userData.name);
    }
  }, [userData]);

  return null;
}
