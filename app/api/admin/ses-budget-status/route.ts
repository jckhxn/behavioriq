import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { getBudgetStatus } from "@/lib/services/email-budget-service";

/**
 * Super Admin SES Budget Status
 * Returns current email usage and budget information
 */

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const budgetStatus = await getBudgetStatus();

    return NextResponse.json(budgetStatus);
  } catch (error) {
    console.error("Error fetching SES budget status:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget status" },
      { status: 500 }
    );
  }
}
