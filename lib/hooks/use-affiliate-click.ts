"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getDeviceSignature } from "@/lib/affiliate/fingerprint";

/**
 * Hook to track affiliate clicks when user arrives with ?ref= parameter
 * Should be called once per page load at the top level
 */
export function useAffiliateClick() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackClick = async () => {
      try {
        const refCode = searchParams.get("ref");
        if (!refCode) return;

        // Generate unique session ID (store in sessionStorage)
        let sessionId = sessionStorage.getItem("affiliate_session_id");
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem("affiliate_session_id", sessionId);
        }

        // Get device fingerprint and IP
        const { deviceId, ip, ua } = await getDeviceSignature();

        // Get UTM parameters if they exist
        const utm = {
          source: searchParams.get("utm_source"),
          medium: searchParams.get("utm_medium"),
          campaign: searchParams.get("utm_campaign"),
          content: searchParams.get("utm_content"),
          term: searchParams.get("utm_term"),
        };

        // Track the click
        const response = await fetch("/api/affiliate/click", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(deviceId && { "x-device-id": deviceId }),
          },
          body: JSON.stringify({
            refCode,
            sessionId,
            ip,
            ua,
            utm: Object.values(utm).some((v) => v) ? utm : null,
          }),
        });

        if (!response.ok) {
          console.warn(
            "[AffiliateClick] Failed to track click:",
            await response.text()
          );
          return;
        }

        const data = await response.json();
        // Store clickId in sessionStorage for later attribution
        if (data.clickId) {
          sessionStorage.setItem("affiliate_click_id", data.clickId);
        }

        console.log("[AffiliateClick] ✅ Tracked click:", refCode);
      } catch (error) {
        console.error("[AffiliateClick] Error tracking click:", error);
      }
    };

    trackClick();
  }, [searchParams]);
}
