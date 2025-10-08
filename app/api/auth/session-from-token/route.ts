import { NextRequest, NextResponse } from "next/server";
import { loginTokenService } from "@/lib/auth/login-token-service";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase session using a login token
 * This is used for auto-login after payment
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Validate and consume the token
    const userId = await loginTokenService.validateAndConsumeToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Generate an auth session for this user in Supabase
    // First, check if user exists in Supabase auth
    const { data: authUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing Supabase users:", listError);
      return NextResponse.json(
        { error: "Failed to verify user in auth system" },
        { status: 500 }
      );
    }

    const authUser = authUsers.users.find((u) => u.email === user.email);

    if (!authUser) {
      console.error(`User ${user.email} not found in Supabase Auth`);
      return NextResponse.json(
        {
          error: "User not found in authentication system",
          details: "Please contact support",
        },
        { status: 404 }
      );
    }

    // Generate a recovery link which can be used to sign in without password
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: user.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
        },
      });

    if (sessionError || !sessionData) {
      console.error("Error generating recovery link:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    console.log("✅ Recovery link generated for user:", user.email);

    // Use Supabase's signInWithPassword to create a proper session
    // We need to use a different approach - create a one-time-password or use email OTP
    // But we can't do that without the user's password...

    // Instead, let's use the hashed_token from the recovery link
    // The recovery link format is: /auth/v1/verify?token=XXX&type=recovery
    const linkUrl = new URL(sessionData.properties.action_link);
    const hashedToken = linkUrl.searchParams.get("token");
    const type = linkUrl.searchParams.get("type");

    if (!hashedToken || type !== "recovery") {
      console.error("Failed to extract token from recovery link");
      console.error("Link:", sessionData.properties.action_link);
      return NextResponse.json(
        { error: "Failed to extract authentication token" },
        { status: 500 }
      );
    }

    // Verify the recovery token to get a session
    const { data: verifyData, error: verifyError } =
      await supabaseAdmin.auth.verifyOtp({
        token_hash: hashedToken,
        type: "recovery",
      });

    if (verifyError || !verifyData.session) {
      console.error("Failed to verify recovery token:", verifyError);
      return NextResponse.json(
        { error: "Failed to create session from token" },
        { status: 500 }
      );
    }

    const accessToken = verifyData.session.access_token;
    const refreshToken = verifyData.session.refresh_token;

    if (!accessToken || !refreshToken) {
      console.error("Failed to extract tokens from verified session");
      return NextResponse.json(
        { error: "Failed to extract authentication tokens" },
        { status: 500 }
      );
    }

    // Return the session tokens that the client can use to sign in
    return NextResponse.json({
      success: true,
      user,
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
