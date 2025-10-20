import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { cancelUserPlan } from "@/lib/services/plan-management-service";

type CancelChoice = "pause" | "lite" | "annual" | "cancel";

function normalizeChoice(choice: unknown): CancelChoice | null {
  if (typeof choice !== "string") return null;
  const lower = choice.trim().toLowerCase();
  if (lower === "pause" || lower === "lite" || lower === "annual" || lower === "cancel") {
    return lower as CancelChoice;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const choice = normalizeChoice(body?.choice);
    if (!choice) {
      return NextResponse.json(
        { error: "Invalid cancel choice" },
        { status: 400 }
      );
    }

    const result = await cancelUserPlan(user.id, choice);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[plan/cancel] POST error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process cancel request" },
      { status: 500 }
    );
  }
}
