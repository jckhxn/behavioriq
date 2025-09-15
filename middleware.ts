import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth(async function middleware(req: NextRequest) {
  const session = await auth()
  const isAuth = !!session?.user
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                     req.nextUrl.pathname.startsWith("/register")

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return null
  }

  if (!isAuth && !isAuthPage) {
    let from = req.nextUrl.pathname
    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }
    
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    )
  }

  // Check admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }
})

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}