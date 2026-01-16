import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/user/onboarding-skip
 * Marks onboarding as skipped/completed for the user
 * Stored in user metadata
 */
export async function POST() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skippedAt = new Date().toISOString();

    // Update user metadata to mark onboarding as completed (skipped counts as completed)
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        onboarding_completed_at: skippedAt,
        onboarding_skipped: true,
      },
    });

    if (error) {
      console.error("[/api/user/onboarding-skip] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update user metadata" },
        { status: 500 }
      );
    }

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
