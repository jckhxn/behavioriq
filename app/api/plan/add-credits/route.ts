import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { addCreditsToUserPlan } from "@/lib/services/plan-management-service";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const qty = Number(body?.qty ?? 0);

    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive number" },
        { status: 400 }
      );
    }

    await addCreditsToUserPlan(user.id, qty);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[plan/add-credits] POST error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add credits" },
      { status: 500 }
    );
  }
}
