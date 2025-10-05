import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { assessmentCreditsService } from "@/lib/services/assessment-credits-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credits = await assessmentCreditsService.checkUserCredits(
      session.user.id
    );

    return NextResponse.json(credits);
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
