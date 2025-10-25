import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

/**
 * POST /api/user/confirm-email-change
 * Confirm email change by validating token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
      select: {
        id: true,
        email: true,
        pendingEmail: true,
        emailVerificationTokenExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      // Clean up expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: null,
          emailVerificationTokenExpiresAt: null,
          pendingEmail: null,
        },
      });

      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    if (!user.pendingEmail) {
      return NextResponse.json(
        { error: "No pending email change found" },
        { status: 400 }
      );
    }

    // Update user with new email and mark as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        emailVerified: true,
        pendingEmail: null,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email successfully updated",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          emailVerified: updatedUser.emailVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm email change" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/confirm-email-change?token=xxx
 * Convenience endpoint for email link verification
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
      select: {
        id: true,
        email: true,
        pendingEmail: true,
        emailVerificationTokenExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      // Clean up expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: null,
          emailVerificationTokenExpiresAt: null,
          pendingEmail: null,
        },
      });

      return NextResponse.redirect(
        new URL("/settings?tab=profile&error=token_expired", request.url)
      );
    }

    if (!user.pendingEmail) {
      return NextResponse.redirect(
        new URL("/settings?tab=profile&error=no_pending_email", request.url)
      );
    }

    // Update user with new email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        emailVerified: true,
        pendingEmail: null,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
      select: {
        email: true,
      },
    });

    // Redirect to settings with success message
    return NextResponse.redirect(
      new URL(
        `/settings?tab=profile&email_verified=true&newEmail=${encodeURIComponent(
          updatedUser.email
        )}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Email confirmation error:", error);
    return NextResponse.redirect(
      new URL("/settings?tab=profile&error=confirmation_failed", request.url)
    );
  }
}
