import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import {
  getUserPlanSummary,
  setAnonymousModeDefault,
  snoozePlanRibbon,
} from "@/lib/services/plan-summary-service";

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await getUserPlanSummary(user.id);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[user/plan] GET error", error);
    return NextResponse.json(
      { error: "Failed to load plan" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const action = payload?.action;

    switch (action) {
      case "snooze_ribbon": {
        const snoozedUntil = await snoozePlanRibbon(user.id, {
          durationHours: payload?.durationHours ?? 24,
          source: payload?.source ?? "header_ribbon",
        });
        return NextResponse.json({ ribbonSnoozedUntil: snoozedUntil });
      }
      case "set_anonymous_mode": {
        const enabled = Boolean(payload?.enabled);
        const anonymousModeEnabled = await setAnonymousModeDefault(
          user.id,
          enabled
        );
        return NextResponse.json({ anonymousModeEnabled });
      }
      default:
        return NextResponse.json(
          { error: "Unsupported action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[user/plan] POST error", error);
    return NextResponse.json(
      { error: "Failed to update plan settings" },
      { status: 500 }
    );
  }
}
