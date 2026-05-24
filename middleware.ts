import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authSecret =
    process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || undefined;

  // Always allow API and static assets to pass through middleware without redirects
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api") // allow all API routes (prevents HTML redirects breaking fetch JSON)
  ) {
    return NextResponse.next({ request: req });
  }

  // CRITICAL: Update Supabase session and sync auth tokens to server cookies
  // This must happen before any auth checks so the middleware can detect logged-in users
  // Do this AFTER the API/static asset early return to avoid unnecessary processing
  let response: NextResponse;
  try {
    response = await updateSession(req);
  } catch (error) {
    console.error("[Middleware] updateSession failed:", error);
    // Fall back to basic next response if updateSession fails
    response = NextResponse.next({ request: req });
  }

  // Capture affiliate ref parameter if present
  const ref = req.nextUrl.searchParams.get("ref");

  if (ref) {
    // Set first-party cookie for 30 days
    // Safari has strict cookie policies - need explicit path for localhost
    const cookieOptions: any = {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      path: "/", // CRITICAL: Must explicitly set path for localhost
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
    };

    // Only set domain if explicitly configured (don't set for localhost)
    const domain = process.env.AFFILIATE_COOKIE_DOMAIN;
    if (domain && domain.trim()) {
      cookieOptions.domain = domain;
    }

    response.cookies.set("biq_ref", ref, cookieOptions);

    console.log(`[Middleware] ✅ Set affiliate cookie: ref=${ref}`);

    // Track click asynchronously (fire and forget)
    trackAffiliateClick(ref, req).catch((e) =>
      console.error("[Middleware] Failed to track affiliate click:", e)
    );
  }

  const hostname = req.headers.get("host") || "";
  const { branding, redirectToMain } = await resolveCustomDomain(req, hostname);

  if (redirectToMain) {
    const redirectResponse = NextResponse.redirect(
      new URL(redirectToMain, req.url)
    );
    // Preserve Supabase auth cookies from the session update
    response.cookies.getAll().forEach(({ name, value }) => {
      redirectResponse.cookies.set(name, value);
    });
    applyBrandingHeaders(redirectResponse, branding);
    return redirectResponse;
  }

  const isMaintenancePage = req.nextUrl.pathname.startsWith("/maintenance");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/auth");

  // ...existing code...

  // Move maintenance mode check after all relevant variable declarations
  // (place this after isPublicPage, isCheckoutPage, isAutoLoginPage are defined)

  const isAuth = isSupabaseAuthenticated(req);
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");

  // Allow auto-login page to complete authentication flow
  const isAutoLoginPage = req.nextUrl.pathname.startsWith("/auth/auto-login");

  // Public pages that don't require authentication
  const protectedPrefixes = [
    "dashboard",
    "admin",
    "district",
    "login",
    "register",
    "api",
    "checkout",
    "payment",
    "trial-assessment",
    "trial-results",
    "share",
    "auth",
  ];
  const isPseoPage =
    /^\/[a-zA-Z0-9-]+$/.test(req.nextUrl.pathname) &&
    !protectedPrefixes.some((prefix) =>
      req.nextUrl.pathname.startsWith(`/${prefix}`)
    );
  const isPublicPage =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/trial-assessment") ||
    req.nextUrl.pathname.startsWith("/trial-results") ||
    req.nextUrl.pathname.startsWith("/consent") ||
    req.nextUrl.pathname.startsWith("/trial/") ||
    req.nextUrl.pathname.startsWith("/results/") ||
    req.nextUrl.pathname.startsWith("/payment") ||
    req.nextUrl.pathname.startsWith("/payment-success") ||
    req.nextUrl.pathname.startsWith("/share") ||
    req.nextUrl.pathname.startsWith("/auth/") ||
    req.nextUrl.pathname.startsWith("/assessment/") || // Allow assessment continuation for paid anonymous users
    isPseoPage;

  // Declare isCheckoutPage before isAllowedDuringMaintenance
  const isCheckoutPage =
    req.nextUrl.pathname.startsWith("/checkout") ||
    req.nextUrl.pathname.startsWith("/checkout-direct") ||
    req.nextUrl.pathname.startsWith("/checkout-anonymous") ||
    req.nextUrl.pathname.startsWith("/trial-checkout");

  // Maintenance mode check (after all relevant variable declarations)
  const isAllowedDuringMaintenance =
    isMaintenancePage ||
    isApiRoute ||
    isAuthRoute ||
    isPublicPage ||
    isCheckoutPage ||
    isAutoLoginPage;

  if (!isAllowedDuringMaintenance) {
    const maintenanceMode = await fetchMaintenanceMode(req);
    if (maintenanceMode) {
      const redirectResponse = NextResponse.redirect(
        new URL("/maintenance", req.url)
      );
      // Preserve Supabase auth cookies
      response.cookies.getAll().forEach(({ name, value }) => {
        redirectResponse.cookies.set(name, value);
      });
      applyBrandingHeaders(redirectResponse, branding);
      return redirectResponse;
    }
  }

  // ...existing code...

  if (!isAuth && !isAuthPage && !isPublicPage) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    const redirectResponse = NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    );
    // Preserve Supabase auth cookies
    response.cookies.getAll().forEach(({ name, value }) => {
      redirectResponse.cookies.set(name, value);
    });
    applyBrandingHeaders(redirectResponse, branding);
    return redirectResponse;
  }

  const protectedPaths = ["/dashboard", "/assessments"];
  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  let token;
  if (isProtectedPath) {
    if (authSecret) {
      token = await getToken({ req, secret: authSecret });
    } else {
      console.warn(
        "[middleware] NEXTAUTH_SECRET/AUTH_SECRET not set; skipping JWT validation in middleware"
      );
    }
    // Check if MFA is required but not enabled
    const requireMFA = process.env.REQUIRE_MFA === "true";
    if (requireMFA && token && !token.mfaEnabled) {
      const redirectResponse = NextResponse.redirect(
        new URL("/settings?tab=security&mfa=required", req.url)
      );
      // Preserve Supabase auth cookies
      response.cookies.getAll().forEach(({ name, value }) => {
        redirectResponse.cookies.set(name, value);
      });
      applyBrandingHeaders(redirectResponse, branding);
      return redirectResponse;
    }
  }

  // Return the response with Supabase auth cookies already set from updateSession
  applyBrandingHeaders(response, branding);
  return response;
}

export const config = {
  matcher: ["/:path*"],
};

type BrandingResponse = {
  id: string;
  name: string;
  logo?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  headerTitle?: string | null;
  footerText?: string | null;
} | null;

function isSupabaseAuthenticated(req: NextRequest): boolean {
  // Check for any Supabase auth token cookie
  // Can be: sb-auth-token (default) or sb-{projectId}-auth-token (custom)
  const allCookies = req.cookies.getAll();
  const cookieNames = allCookies.map((c) => c.name);

  // Look for any cookie that matches Supabase auth pattern
  const hasAuthCookie = cookieNames.some(
    (name) =>
      name === "sb-auth-token" ||
      (name.startsWith("sb-") && name.includes("-auth-token"))
  );

  // Debug logging
  if (!hasAuthCookie) {
    const authCookies = allCookies
      .filter((c) => c.name.includes("auth") || c.name.includes("sb-"))
      .map((c) => c.name);
    if (authCookies.length > 0) {
      console.warn(
        `[Middleware] No Supabase auth cookie found. Available auth cookies:`,
        authCookies
      );
    }
  }

  return hasAuthCookie;
}

async function fetchMaintenanceMode(req: NextRequest): Promise<boolean> {
  try {
    const url = new URL("/api/platform/maintenance", req.nextUrl);
    const response = await fetch(url.toString(), {
      headers: { "x-from-middleware": "1" },
      cache: "no-store",
    });

    if (!response.ok) return false;

    const data = await response.json();
    return Boolean(data?.maintenanceMode);
  } catch (error) {
    console.error("Maintenance mode fetch error:", error);
    return false;
  }
}

async function resolveCustomDomain(req: NextRequest, hostname: string) {
  const result: {
    branding: BrandingResponse;
    redirectToMain?: string;
  } = { branding: null };

  // Skip if it's the main domain or localhost
  if (hostname === "localhost:3000" || hostname.includes("aidiagnostic.com")) {
    return result;
  }

  try {
    const url = new URL("/api/branding/domain", req.nextUrl);
    url.searchParams.set("domain", hostname);

    const response = await fetch(url.toString(), {
      headers: { "x-from-middleware": "1" },
      cache: "no-store",
    });

    if (!response.ok) {
      return result;
    }

    const data = await response.json();

    if (data?.branding) {
      result.branding = data.branding as BrandingResponse;
    }
  } catch (error) {
    console.error("Custom domain resolution error:", error);
  }

  return result;
}

function applyBrandingHeaders(
  response: NextResponse,
  branding: BrandingResponse
) {
  if (!branding) return;

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
}

/**
 * Track affiliate click asynchronously
 * Non-blocking to avoid slowing down page load
 */
async function trackAffiliateClick(refCode: string, req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const sessionId =
      req.cookies.get("sessionId")?.value || generateSessionId();

    // Extract UTM parameters
    const utm = {
      source: req.nextUrl.searchParams.get("utm_source"),
      medium: req.nextUrl.searchParams.get("utm_medium"),
      campaign: req.nextUrl.searchParams.get("utm_campaign"),
      content: req.nextUrl.searchParams.get("utm_content"),
      term: req.nextUrl.searchParams.get("utm_term"),
    };

    // Call click tracking endpoint
    const response = await fetch(`${baseUrl}/api/affiliate/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refCode,
        sessionId,
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        ua: req.headers.get("user-agent"),
        utm: Object.values(utm).some((v) => v) ? utm : null,
      }),
    });

    if (!response.ok) {
      console.error(
        `[Middleware] Failed to track click: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("[Middleware] Error tracking affiliate click:", error);
    // Silently fail - don't block page load
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
