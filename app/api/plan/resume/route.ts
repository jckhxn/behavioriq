import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { resumeUserSubscription } from "@/lib/services/plan-management-service";

export async function POST() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await resumeUserSubscription(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[plan/resume] POST error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to resume plan" },
      { status: 500 }
    );
  }
}
