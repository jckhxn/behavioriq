/**
 * Affiliate onboarding helper - called during signup/auth to lock attribution
 */

import { getDeviceSignature } from "./fingerprint";

export async function attributeSignupToAffiliate(userId: string) {
  try {
    // Get device info
    const { deviceId, ip, ua } = await getDeviceSignature();

    // Get stored click ID from sessionStorage
    const clickId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("affiliate_click_id")
        : null;

    // Get ref code from sessionStorage or URL
    let refCode =
      typeof window !== "undefined"
        ? sessionStorage.getItem("affiliate_ref_code")
        : null;

    if (!refCode) {
      // Try to get from URL
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      refCode = params.get("ref");
    }

    if (!refCode) {
      console.log("[AffiliateOnboarding] No referral code found, skipping attribution");
      return;
    }

    // Call attribution endpoint
    const response = await fetch("/api/affiliate/attribute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(deviceId && { "x-device-id": deviceId }),
      },
      body: JSON.stringify({
        refCode,
        prospectUserId: userId,
        clickId: clickId || null,
        deviceId: deviceId || null,
        ip: ip || null,
        utm: null, // Could add UTM from URL if needed
      }),
    });

    if (!response.ok) {
      console.warn(
        "[AffiliateOnboarding] Failed to attribute signup:",
        await response.text()
      );
      return;
    }

    const data = await response.json();
    console.log("[AffiliateOnboarding] ✅ Attribution locked:", data);

    // Clear affiliate-related session data
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("affiliate_click_id");
      sessionStorage.removeItem("affiliate_ref_code");
    }
  } catch (error) {
    console.error("[AffiliateOnboarding] Error attributing signup:", error);
  }
}
