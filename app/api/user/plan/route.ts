import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { getPlanData } from "@/lib/services/plan-service";

/**
 * GET /api/user/plan
 * Returns the current user's plan data including subscription info
 * Used by usePlanData() hook
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

    // Get plan data for the user
    const planData = await getPlanData(user.id);

    return NextResponse.json(planData);
  } catch (error) {
    console.error("[/api/user/plan] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan data" },
      { status: 500 }
    );
  }
}
