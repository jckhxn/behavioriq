import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/user/onboarding-complete
 * Marks onboarding as completed for the user
 * Stored in user metadata
 */
export async function POST() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const completedAt = new Date().toISOString();

    // Update user metadata to mark onboarding as completed
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        onboarding_completed_at: completedAt,
        onboarding_skipped: false,
      },
    });

    if (error) {
      console.error("[/api/user/onboarding-complete] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update user metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      completedAt,
    });
  } catch (error) {
    console.error("[/api/user/onboarding-complete] Error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
