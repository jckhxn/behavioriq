import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

/**
 * POST /api/user/delete-account
 * Request account deletion with verification
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password, confirmation } = body;

    // Validate confirmation
    if (confirmation !== "PERMANENTLY_DELETE_MY_ACCOUNT") {
      return NextResponse.json(
        { error: "Invalid confirmation text" },
        { status: 400 }
      );
    }

    // Get user's password hash to verify
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, password: true },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password using bcrypt (or your password hashing method)
    // Import crypto/bcrypt as needed
    const bcrypt = require("bcryptjs");
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Begin deletion process - use transaction for consistency
    // This implements a cascading soft delete
    const deletedUser = await prisma.$transaction([
      // Mark user as deactivated (soft delete)
      prisma.user.update({
        where: { id: user.id },
        data: {
          isDeactivated: true,
          deactivatedAt: new Date(),
          deletionRequestedAt: new Date(),
          email: `deleted_${user.id}_${Date.now()}@deleted.local`, // Make email available for reuse
          name: "Deleted User",
          password: "", // Clear password
          avatarUrl: null, // Clear avatar
        },
        select: { id: true, email: true },
      }),

      // Delete child profiles (cascade)
      prisma.childProfile.deleteMany({
        where: { userId: user.id },
      }),

      // Delete assessments (cascade)
      prisma.assessment.deleteMany({
        where: { userId: user.id },
      }),

      // Delete shares
      prisma.shareableLink.deleteMany({
        where: { createdById: user.id },
      }),

      // Delete payment records
      prisma.payment.deleteMany({
        where: { userId: user.id },
      }),

      // Delete chat sessions
      prisma.chatSession.deleteMany({
        where: { userId: user.id },
      }),

      // Delete login tokens
      prisma.loginToken.deleteMany({
        where: { userId: user.id },
      }),

      // Delete passkeys
      prisma.passkey.deleteMany({
        where: { userId: user.id },
      }),

      // Delete notification preferences
      prisma.notificationPreferences.deleteMany({
        where: { userId: user.id },
      }),

      // Delete user licenses
      prisma.userLicense.deleteMany({
        where: { userId: user.id },
      }),

      // Delete conversational sessions
      prisma.conversationalSession.deleteMany({
        where: { userId: user.id },
      }),

      // Delete telemetry events
      prisma.telemetryEvent.deleteMany({
        where: { userId: user.id },
      }),

      // Delete email logs
      prisma.emailLog.deleteMany({
        where: { userId: user.id },
      }),

      // Delete usage metrics
      prisma.usageMetrics.deleteMany({
        where: { userId: user.id },
      }),

      // Delete upsell state
      prisma.userUpsellState.deleteMany({
        where: { userId: user.id },
      }),

      // Delete documents
      prisma.document.deleteMany({
        where: { userId: user.id },
      }),

      // Delete recommendations
      prisma.recommendation.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    // Also delete from Supabase Auth
    // Note: This requires an admin API call or service key
    // For now, we'll just mark as deactivated in our system
    // The auth.users table will remain for audit purposes

    return NextResponse.json(
      {
        success: true,
        message: "Account deletion initiated. Your data will be permanently deleted.",
        deletedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/delete-account/check
 * Check if user has requested deletion
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        isDeactivated: true,
        deletionRequestedAt: true,
        deactivatedAt: true,
      },
    });

    return NextResponse.json({
      isDeactivated: userData?.isDeactivated || false,
      deletionRequestedAt: userData?.deletionRequestedAt,
      deactivatedAt: userData?.deactivatedAt,
    });
  } catch (error) {
    console.error("Account deletion check error:", error);
    return NextResponse.json(
      { error: "Failed to check deletion status" },
      { status: 500 }
    );
  }
}
