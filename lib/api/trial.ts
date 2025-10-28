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
 * Supports both:
 * - Old system: /api/trial/results?trialId=... (AssessmentTrial model)
 * - New system: /api/assessment/[id]/results (Assessment model with mode=TRIAL)
 */
export async function getResults(id: string): Promise<TrialResults> {
  // Try new assessment results endpoint first
  let res = await fetch(`/api/assessment/${encodeURIComponent(id)}/results`, {
    cache: "no-store",
  });

  // Fall back to legacy trial results endpoint if new endpoint returns 404
  if (!res.ok && res.status === 404) {
    res = await fetch(
      `/api/trial/results?trialId=${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to load results");
  }

  const data = await res.json();

  // Transform new format to old format if needed
  if (data.id && data.mode) {
    // New assessment format - transform to TrialResults
    return {
      childLabel: data.childLabel || "Child",
      age: 0,
      completedAt: data.completedAt,
      anonymous: data.anonymous,
      domains: data.domains || [],
      subdomains: [],
      flags: data.flags || [],
      sessionId: data.sessionId || "",
    };
  }

  return data;
}

/**
 * Create Stripe checkout session for trial conversion
 * Supports both assessmentId (new flow) and trialId (legacy flow)
 */
export async function createCheckout(input: {
  product: "full_assessment";
  assessmentId?: string;  // NEW: assessment ID
  trialId?: string;       // LEGACY: trial ID
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
 * Supports both assessmentId (new flow) and trialId (legacy flow)
 */
export async function submitLead(input: {
  email: string;
  consentMarketing: boolean;
  assessmentId?: string;  // NEW: assessment ID
  trialId?: string;       // LEGACY: trial ID
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
 * Supports both assessmentId (new flow) and trialId (legacy flow)
 */
export async function downloadSnapshot(input: {
  assessmentId?: string;  // NEW: assessment ID
  trialId?: string;       // LEGACY: trial ID
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
