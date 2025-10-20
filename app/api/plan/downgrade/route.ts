import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { downgradeUserPlan } from "@/lib/services/plan-management-service";

function normalizeTarget(target: unknown): "core" | null {
  if (typeof target !== "string") return null;
  const value = target.trim().toLowerCase();
  return value === "core" ? "core" : null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const target = normalizeTarget(body?.target);
    if (!target) {
      return NextResponse.json(
        { error: "Target must be 'core'" },
        { status: 400 }
      );
    }

    const effectiveDate = body?.effectiveAt
      ? new Date(body.effectiveAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (Number.isNaN(effectiveDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid effective date" },
        { status: 400 }
      );
    }

    const result = await downgradeUserPlan(user.id, target, effectiveDate);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[plan/downgrade] POST error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to schedule downgrade" },
      { status: 500 }
    );
  }
}
