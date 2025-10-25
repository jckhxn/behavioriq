import { redirect } from "next/navigation";

/**
 * Legacy trial-assessment page
 * Redirects to new nested routes structure (/consent)
 * Preserves query parameters for UTM tracking and affiliate refs
 */
export default function TrialAssessmentRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Build query string preserving all params
  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryString.append(key, v));
      } else {
        queryString.append(key, value);
      }
    }
  }

  const redirectUrl = `/consent${queryString.toString() ? `?${queryString.toString()}` : ""}`;
  redirect(redirectUrl);
}
