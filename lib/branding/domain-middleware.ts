/**
 * Custom Domain Middleware
 *
 * Handles custom domain routing and branding injection for organizations
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrganizationBranding } from "@/lib/branding/branding-service";

export async function handleCustomDomain(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Skip if it's the main domain or localhost
  if (hostname === "localhost:3000" || hostname.includes("aidiagnostic.com")) {
    return NextResponse.next();
  }

  try {
    // Check if this is a custom domain
    const branding = await getOrganizationBranding(hostname, "domain");

    if (branding) {
      // Add organization context to headers for downstream components
      const response = NextResponse.next();
      response.headers.set("x-organization-id", branding.id);
      response.headers.set("x-organization-name", branding.name);

      if (branding.primaryColor) {
        response.headers.set("x-brand-primary", branding.primaryColor);
      }

      if (branding.secondaryColor) {
        response.headers.set("x-brand-secondary", branding.secondaryColor);
      }

      if (branding.logo) {
        response.headers.set("x-brand-logo", branding.logo);
      }

      if (branding.headerTitle) {
        response.headers.set("x-brand-header-title", branding.headerTitle);
      }

      if (branding.footerText) {
        response.headers.set("x-brand-footer-text", branding.footerText);
      }

      return response;
    }

    // Custom domain not found - redirect to main site or show error
    if (process.env.NODE_ENV === "production") {
      return NextResponse.redirect(
        new URL("https://aidiagnostic.com", request.url)
      );
    }
  } catch (error) {
    console.error("Custom domain middleware error:", error);
  }

  return NextResponse.next();
}

/**
 * Get organization context from headers (set by middleware)
 */
export function getOrganizationContext(headers: Headers) {
  return {
    organizationId: headers.get("x-organization-id"),
    organizationName: headers.get("x-organization-name"),
    brandPrimary: headers.get("x-brand-primary"),
    brandSecondary: headers.get("x-brand-secondary"),
    brandLogo: headers.get("x-brand-logo"),
    brandHeaderTitle: headers.get("x-brand-header-title"),
    brandFooterText: headers.get("x-brand-footer-text"),
  };
}
