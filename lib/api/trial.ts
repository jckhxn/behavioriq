/**
 * Trial Assessment API Client
 * Handles all API calls for trial assessment flow
 */

export type DomainScore = {
  name: string;
  score: number;      // 0-100 scale
  screener: number;   // Cutoff threshold
  diagnostic: number; // Reference threshold
};

export type TrialResults = {
  childLabel: string;
  age: number;
  completedAt: string;
  anonymous: boolean;
  domains: DomainScore[];      // Overall domains (4 items)
  subdomains: DomainScore[];   // Specific areas (4 items)
  flags: string[];             // Elevated domains
  sessionId: string;
};

/**
 * Fetch trial results from API
 */
export async function getResults(trialId: string): Promise<TrialResults> {
  const res = await fetch(
    `/api/trial/results?trialId=${encodeURIComponent(trialId)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to load results");
  }

  return res.json();
}

/**
 * Create Stripe checkout session for trial conversion
 */
export async function createCheckout(input: {
  product: "full_assessment";
  trialId: string;
  sessionId: string;
  couponCode?: string;
}): Promise<{ checkoutUrl: string }> {
  const res = await fetch("/api/checkout/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Checkout creation failed");
  }

  return res.json();
}

/**
 * Submit email lead and get coupon code
 */
export async function submitLead(input: {
  email: string;
  consentMarketing: boolean;
  trialId: string;
  sessionId: string;
}): Promise<{
  leadId: string;
  couponCode: string;
  couponExpiresAt: string;
}> {
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Lead submission failed");
  }

  return res.json();
}

/**
 * Download snapshot PDF (watermarked, no recommendations)
 */
export async function downloadSnapshot(input: {
  trialId: string;
  sessionId: string;
}): Promise<{ pdfUrl: string }> {
  const res = await fetch("/api/snapshot/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "PDF generation failed");
  }

  return res.json();
}
