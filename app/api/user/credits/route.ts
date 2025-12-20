import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { assessmentCreditsService } from "@/lib/services/assessment-credits-service";

/**
 * GET /api/user/credits
 * Returns the current user's assessment credits information
 * Used by useAssessmentCredits() hook to display remaining credits
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

    // Get credits info from the assessment service
    const credits = await assessmentCreditsService.checkUserCredits(user.id);

    return NextResponse.json(credits);
  } catch (error) {
    console.error("[/api/user/credits] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
