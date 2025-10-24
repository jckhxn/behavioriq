"use client";

import { useAffiliateClick } from "@/lib/hooks/use-affiliate-click";

/**
 * Client component that tracks affiliate clicks
 * Must be placed in the root layout to work on all pages
 */
export function AffiliateTracker() {
  useAffiliateClick();
  return null;
}
