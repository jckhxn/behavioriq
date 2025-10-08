import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleCustomDomain } from "@/lib/branding/domain-middleware";

export async function middleware(req: NextRequest) {
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

  // Check admin routes - we'll need to fetch user from database
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // For admin routes, we need to check the user's role from the database
    // This will be handled by the page itself for now
    // TODO: Consider adding role to user metadata for faster checks
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|trial-assessment|trial-results|payment).*)",
  ],
};
