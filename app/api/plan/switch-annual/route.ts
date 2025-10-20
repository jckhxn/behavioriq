import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { switchUserToAnnual } from "@/lib/services/plan-management-service";

function normalizeTarget(target: unknown): "core" | "family" {
  if (typeof target !== "string") return "core";
  const value = target.trim().toLowerCase();
  return value === "family" ? "family" : "core";
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const target = normalizeTarget(body?.plan);

    const result = await switchUserToAnnual(user.id, target);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[plan/switch-annual] POST error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to switch plan" },
      { status: 500 }
    );
  }
}
