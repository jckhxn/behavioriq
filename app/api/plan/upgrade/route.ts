import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { upgradeUserPlan } from "@/lib/services/plan-management-service";

type PlanTarget = "core" | "family";
type PlanTerm = "monthly" | "annual";

function normalizeTarget(target: unknown): PlanTarget | null {
  if (typeof target !== "string") return null;
  const value = target.trim().toLowerCase();
  return value === "core" || value === "family" ? (value as PlanTarget) : null;
}

function normalizeTerm(term: unknown): PlanTerm {
  if (typeof term !== "string") return "monthly";
  const value = term.trim().toLowerCase();
  return value === "annual" ? "annual" : "monthly";
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const target = normalizeTarget(body?.target);
    const term = normalizeTerm(body?.term);

    if (!target) {
      return NextResponse.json(
        { error: "Target plan must be 'core' or 'family'" },
        { status: 400 }
      );
    }

    const result = await upgradeUserPlan(user.id, target, term);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[plan/upgrade] POST error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upgrade plan" },
      { status: 500 }
    );
  }
}
