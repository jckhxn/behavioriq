import { NextRequest, NextResponse } from "next/server";
import { loginTokenService } from "@/lib/auth/login-token-service";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Login token is required" },
        { status: 400 }
      );
    }

    console.log("[Login Token] Validating token:", token.substring(0, 8) + "...");

    // Validate and consume the login token
    const userId = await loginTokenService.validateAndConsumeToken(token);

    if (!userId) {
      console.error("[Login Token] Invalid or expired token");
      return NextResponse.json(
        { error: "Invalid or expired login token" },
        { status: 401 }
      );
    }

    console.log("[Login Token] Token valid for user:", userId);

    // Get user data
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
      console.error("[Login Token] User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a temporary one-time password for this login
    const crypto = require("crypto");
    const tempPassword = crypto.randomBytes(32).toString("hex");

    // Create a Supabase admin client
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

    // Temporarily set the user's password to the temp password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: tempPassword }
    );

    if (updateError) {
      console.error("[Login Token] Failed to set temp password:", updateError);
      return NextResponse.json(
        { error: "Failed to prepare authentication" },
        { status: 500 }
      );
    }

    // Update last login time
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });

    console.log("[Login Token] ✅ Temp password created for:", user.email);

    // Return the temporary password for the client to use
    return NextResponse.json({
      success: true,
      tempPassword,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Login Token] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process login token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
