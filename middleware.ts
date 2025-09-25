import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleCustomDomain } from "@/lib/branding/domain-middleware";

export default auth(async function middleware(req: NextRequest) {
  // Handle custom domain routing first
  const customDomainResponse = await handleCustomDomain(req);
  if (customDomainResponse && customDomainResponse !== NextResponse.next()) {
    return customDomainResponse;
  }

  const session = await auth();
  const isAuth = !!session?.user;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");

  // Public pages that don't require authentication
  const isPublicPage =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/trial-assessment") ||
    req.nextUrl.pathname.startsWith("/trial-results") ||
    req.nextUrl.pathname.startsWith("/payment") ||
    req.nextUrl.pathname.startsWith("/payment-success") ||
    req.nextUrl.pathname.startsWith("/share"); // Allow shared assessments

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
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

  // Check admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return customDomainResponse || null;
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|trial-assessment|trial-results|payment).*)",
  ],
};
