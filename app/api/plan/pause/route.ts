import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import {
  PlanPauseLimitError,
} from "@/lib/services/plan-summary-service";
import { pauseUserSubscription } from "@/lib/services/plan-management-service";

export async function POST() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeAt } = await pauseUserSubscription(user.id);
    return NextResponse.json({ success: true, resumeAt });
  } catch (error) {
    if (error instanceof PlanPauseLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error("[plan/pause] POST error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to pause plan" },
      { status: 500 }
    );
  }
}
