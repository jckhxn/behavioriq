import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /api/user/onboarding-status
 * Returns whether the user needs to complete onboarding
 * Stored in Supabase auth user metadata
 */
export async function GET() {
  try {
    // Get the Supabase auth user directly (not the database user)
    // because onboarding state is stored in Supabase user_metadata
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user metadata for onboarding status (from Supabase auth user)
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
