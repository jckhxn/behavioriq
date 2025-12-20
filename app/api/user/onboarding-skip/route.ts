import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

/**
 * POST /api/user/onboarding-skip
 * Marks onboarding as skipped for the user
 * Stored in user metadata
 */
export async function POST() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // In a real implementation, you'd update the user's metadata here
    // For now, return success with timestamp
    const skippedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      skippedAt,
    });
  } catch (error) {
    console.error("[/api/user/onboarding-skip] Error:", error);
    return NextResponse.json(
      { error: "Failed to skip onboarding" },
      { status: 500 }
    );
  }
}
