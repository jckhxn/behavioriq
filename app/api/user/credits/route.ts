import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { assessmentCreditsService } from "@/lib/services/assessment-credits-service";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user) {
      console.log("Credits API: No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`Credits API: Fetching credits for user ${user.id}`);
    const credits = await assessmentCreditsService.checkUserCredits(user.id);

    console.log(
      `Credits API: Successfully fetched credits for user ${user.id}`,
      {
        hasCredits: credits.hasCredits,
        creditsRemaining: credits.creditsRemaining,
        licenseType: credits.licenseType,
      }
    );

    return NextResponse.json(credits);
  } catch (error) {
    console.error("Error fetching user credits:", error);

    // Provide more specific error messages
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch credits";
    const isConfigError = errorMessage.includes("configuration");

    return NextResponse.json(
      {
        error: isConfigError
          ? "Server configuration error. Please check environment variables."
          : "Failed to fetch credits",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: isConfigError ? 503 : 500 }
    );
  }
}
