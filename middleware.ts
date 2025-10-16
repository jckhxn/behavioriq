import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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
    return NextResponse.next();
  }

  const hostname = req.headers.get("host") || "";
  const { branding, redirectToMain } = await resolveCustomDomain(req, hostname);

  if (redirectToMain) {
    const redirectResponse = NextResponse.redirect(
      new URL(redirectToMain, req.url)
    );
    applyBrandingHeaders(redirectResponse, branding);
    return redirectResponse;
  }

  const isMaintenancePage = req.nextUrl.pathname.startsWith("/maintenance");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");

  if (!isMaintenancePage && !isApiRoute) {
    const maintenanceMode = await fetchMaintenanceMode(req);
    if (maintenanceMode) {
      const redirectResponse = NextResponse.redirect(
        new URL("/maintenance", req.url)
      );
      applyBrandingHeaders(redirectResponse, branding);
      return redirectResponse;
    }
  }

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
    req.nextUrl.pathname.startsWith("/payment") ||
    req.nextUrl.pathname.startsWith("/payment-success") ||
    req.nextUrl.pathname.startsWith("/share") ||
    req.nextUrl.pathname.startsWith("/auth/") ||
    isPseoPage;

  // Allow auto-login to complete even if already authenticated
  if (isAutoLoginPage) {
    const response = NextResponse.next();
    applyBrandingHeaders(response, branding);
    return response;
  }

  if (isAuthPage) {
    if (isAuth) {
      const redirectResponse = NextResponse.redirect(
        new URL("/", req.url)
      );
      applyBrandingHeaders(redirectResponse, branding);
      return redirectResponse;
    }
    const response = NextResponse.next();
    applyBrandingHeaders(response, branding);
    return response;
  }

  // Allow access to public pages without authentication
  if (isPublicPage) {
    const response = NextResponse.next();
    applyBrandingHeaders(response, branding);
    return response;
  }

  // Allow checkout pages regardless of auth (flow handles auth inside pages)
  const isCheckoutPage =
    req.nextUrl.pathname.startsWith("/checkout") ||
    req.nextUrl.pathname.startsWith("/checkout-direct") ||
    req.nextUrl.pathname.startsWith("/checkout-anonymous") ||
    req.nextUrl.pathname.startsWith("/trial-checkout");
  if (isCheckoutPage) {
    const response = NextResponse.next();
    applyBrandingHeaders(response, branding);
    return response;
  }

  if (!isAuth && !isAuthPage && !isPublicPage) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    const redirectResponse = NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    );
    applyBrandingHeaders(redirectResponse, branding);
    return redirectResponse;
  }

  // Check admin routes - we'll need to fetch user from database
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // For admin routes, we need to check the user's role from the database
    // This will be handled by the page itself for now
    // TODO: Consider adding role to user metadata for faster checks
  }

  const protectedPaths = ["/dashboard", "/assessments", "/admin"];
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
      applyBrandingHeaders(redirectResponse, branding);
      return redirectResponse;
    }
  }

  const response = NextResponse.next();
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

const SUPABASE_AUTH_COOKIE_NAME = getSupabaseAuthCookieName();

function getSupabaseAuthCookieName(): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const match = supabaseUrl.match(/^https:\/\/([a-zA-Z0-9-]+)\.supabase\.co/);
  if (!match) return null;

  return `sb-${match[1]}-auth-token`;
}

function isSupabaseAuthenticated(req: NextRequest): boolean {
  if (!SUPABASE_AUTH_COOKIE_NAME) return false;
  return req.cookies.has(SUPABASE_AUTH_COOKIE_NAME);
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
