import { redirect } from "next/navigation";

/**
 * Legacy trial-assessment page
 * Redirects to new nested routes structure (/consent)
 * Preserves query parameters for UTM tracking and affiliate refs
 */
export default async function TrialAssessmentRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Await searchParams as required by Next.js 15+
  const params = await searchParams;

  // Build query string preserving all params
  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
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
