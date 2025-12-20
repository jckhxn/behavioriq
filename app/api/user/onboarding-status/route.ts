import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

/**
 * GET /api/user/onboarding-status
 * Returns whether the user needs to complete onboarding
 * Stored in user metadata
 */
export async function GET() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check user metadata for onboarding status
    const metadata = user.user_metadata || {};
    const completedAt = metadata.onboarding_completed_at;
    const currentStep = metadata.onboarding_current_step || 0;

    const needsOnboarding = !completedAt;

    return NextResponse.json({
      needsOnboarding,
      completedAt: completedAt || null,
      currentStep,
    });
  } catch (error) {
    console.error("[/api/user/onboarding-status] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding status" },
      { status: 500 }
    );
  }
}
