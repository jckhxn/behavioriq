import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleCustomDomain } from "@/lib/branding/domain-middleware";
import { getToken } from "next-auth/jwt";
import { isMaintenanceModeEnabled } from "@/lib/platform/settings";

export async function middleware(req: NextRequest) {
  // Check maintenance mode first (before anything else)
  const isMaintenancePage = req.nextUrl.pathname.startsWith("/maintenance");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");

  if (!isMaintenancePage && !isApiRoute) {
    const maintenanceMode = await isMaintenanceModeEnabled();
    if (maintenanceMode) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }
  }

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: req.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          req.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: req.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Handle custom domain routing first
  const customDomainResponse = await handleCustomDomain(req);
  if (customDomainResponse && customDomainResponse !== NextResponse.next()) {
    return customDomainResponse;
  }

  const isAuth = !!user;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");

  // Allow auto-login page to complete authentication flow
  const isAutoLoginPage = req.nextUrl.pathname.startsWith("/auth/auto-login");

  // Public pages that don't require authentication
  const isPublicPage =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/trial-assessment") ||
    req.nextUrl.pathname.startsWith("/trial-results") ||
    req.nextUrl.pathname.startsWith("/payment") ||
    req.nextUrl.pathname.startsWith("/payment-success") ||
    req.nextUrl.pathname.startsWith("/share") || // Allow shared assessments
    req.nextUrl.pathname.startsWith("/auth/"); // Allow all auth flow pages

  // Allow auto-login to complete even if already authenticated
  if (isAutoLoginPage) {
    return customDomainResponse || null;
  }

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return customDomainResponse || null;
  }

  // Allow access to public pages without authentication
  if (isPublicPage) {
    return customDomainResponse || null;
  }

  if (!isAuth && !isAuthPage && !isPublicPage) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  // Check admin routes - we'll need to fetch user from database
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // For admin routes, we need to check the user's role from the database
    // This will be handled by the page itself for now
    // TODO: Consider adding role to user metadata for faster checks
  }

  const token = await getToken({ req: req });

  // Check if MFA is required but not enabled
  const requireMFA = process.env.REQUIRE_MFA === "true";
  const protectedPaths = ["/dashboard", "/assessments", "/admin"];
  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (requireMFA && isProtectedPath && token && !token.mfaEnabled) {
    return NextResponse.redirect(
      new URL("/settings?tab=security&mfa=required", req.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/auth|api/stripe|_next/static|_next/image|favicon.ico|trial-assessment|trial-results|payment).*)",
    "/dashboard/:path*",
    "/assessments/:path*",
    "/admin/:path*",
  ],
};
