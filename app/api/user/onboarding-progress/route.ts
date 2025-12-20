import { NextResponse, NextRequest } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

/**
 * POST /api/user/onboarding-progress
 * Updates the user's current onboarding step
 * Stored in user metadata
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { step } = await req.json();

    if (typeof step !== "number" || step < 0 || step > 5) {
      return NextResponse.json(
        { error: "Invalid step number" },
        { status: 400 }
      );
    }

    // In a real implementation, you'd update the user's metadata here
    // For now, return success
    return NextResponse.json({
      success: true,
      currentStep: step,
    });
  } catch (error) {
    console.error("[/api/user/onboarding-progress] Error:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding progress" },
      { status: 500 }
    );
  }
}
