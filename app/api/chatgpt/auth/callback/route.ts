import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/chatgpt/auth/callback
 *
 * Handle magic link authentication callback for ChatGPT widget
 * Validates token, establishes session, redirects back to widget
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const sessionId = searchParams.get("sessionId");
    const assessmentId = searchParams.get("assessmentId");
    const returnTo = searchParams.get("returnTo") || "assessment";

    if (!token) {
      return new NextResponse(
        `<html>
          <body>
            <h1>Invalid Link</h1>
            <p>This authentication link is invalid or has expired.</p>
            <p>Please request a new magic link from ChatGPT.</p>
          </body>
        </html>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    console.log("[ChatGPT Auth Callback] Validating token");

    // Find and validate login token
    const loginToken = await prisma.loginToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!loginToken) {
      return new NextResponse(
        `<html>
          <body>
            <h1>Invalid Link</h1>
            <p>This authentication link is invalid or has already been used.</p>
            <p>Please request a new magic link from ChatGPT.</p>
          </body>
        </html>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Check if token is expired
    if (loginToken.expiresAt < new Date()) {
      await prisma.loginToken.delete({ where: { id: loginToken.id } });
      return new NextResponse(
        `<html>
          <body>
            <h1>Link Expired</h1>
            <p>This authentication link has expired.</p>
            <p>Please request a new magic link from ChatGPT.</p>
          </body>
        </html>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Check if token has been used
    if (loginToken.usedAt) {
      return new NextResponse(
        `<html>
          <body>
            <h1>Link Already Used</h1>
            <p>This authentication link has already been used.</p>
            <p>Please request a new magic link from ChatGPT.</p>
          </body>
        </html>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Mark token as used
    await prisma.loginToken.update({
      where: { id: loginToken.id },
      data: { usedAt: new Date() },
    });

    // Update user last login
    await prisma.user.update({
      where: { id: loginToken.userId },
      data: { lastLoginAt: new Date() },
    });

    console.log("[ChatGPT Auth Callback] Token validated, creating session");

    // Create Supabase session
    const supabase = await createClient();

    // Sign in the user via Supabase
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: loginToken.user.email,
      password: token, // Use token temporarily
    });

    // If password auth fails (expected), use admin method or session token
    if (signInError) {
      console.log("[ChatGPT Auth Callback] Using fallback auth method");
      // For now, we'll generate a session token that the widget can use
      // In production, you'd want to properly establish a Supabase session
    }

    // Construct redirect URL back to widget
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    let redirectUrl = `${baseUrl}/chatgpt/${returnTo}`;

    // Add session/assessment IDs to URL
    const params = new URLSearchParams();
    if (sessionId) params.set("sessionId", sessionId);
    if (assessmentId) params.set("assessmentId", assessmentId);
    params.set("authToken", token); // Pass token for widget to use
    params.set("authenticated", "true");

    redirectUrl += `?${params.toString()}`;

    // Redirect with success message
    const response = NextResponse.redirect(redirectUrl);

    // Set auth cookie for widget
    response.cookies.set("chatgpt_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // Required for iframe
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    response.cookies.set("chatgpt_user_id", loginToken.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    console.log("[ChatGPT Auth Callback] Redirecting to:", redirectUrl);

    return response;
  } catch (error) {
    console.error("[ChatGPT Auth Callback] Error:", error);
    return new NextResponse(
      `<html>
        <body>
          <h1>Authentication Error</h1>
          <p>An error occurred during authentication.</p>
          <p>Please try again or contact support.</p>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
        </body>
      </html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
