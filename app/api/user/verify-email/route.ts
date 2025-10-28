import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

/**
 * POST /api/user/verify-email
 * Request new email verification token and send verification email
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail } = body;

    if (!newEmail) {
      return NextResponse.json(
        { error: "New email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already in use" },
        { status: 400 }
      );
    }

    // Generate verification token (32 bytes = 64 character hex string)
    const token = crypto.randomBytes(32).toString("hex");

    // Set token expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with pending email and verification token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        pendingEmail: newEmail,
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: expiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        pendingEmail: true,
      },
    });

    // Send verification email (TODO: integrate with email service)
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

    // Note: Email sending is not yet implemented
    // In the meantime, we still create the verification token

    return NextResponse.json(
      {
        success: true,
        message: "Verification token created. Email notification not yet implemented.",
        pendingEmail: newEmail,
        verificationLink: process.env.NODE_ENV === "development" ? verificationLink : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
