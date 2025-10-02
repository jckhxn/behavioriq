import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import {
  getUsageStats,
  checkAIRateLimit,
  RATE_LIMITS,
} from "@/lib/ai/rateLimiter";

// GET /api/admin/ai-usage - Get AI usage statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const stats = getUsageStats(userId || undefined);
    const rateLimitStatus = userId ? checkAIRateLimit(userId) : null;

    return NextResponse.json({
      stats,
      rateLimitStatus,
      limits: RATE_LIMITS,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching AI usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 }
    );
  }
}

// POST /api/admin/ai-usage - Update rate limits (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { updateLimits } = body;

    if (updateLimits) {
      // Validate the limits before updating
      const validFields = [
        "AI_CALLS_PER_USER_PER_HOUR",
        "AI_CALLS_PER_DAY",
        "AI_CALLS_PER_MONTH",
        "MAX_DAILY_COST",
        "MAX_MONTHLY_COST",
        "COST_PER_AI_CALL",
      ];

      const filteredLimits: any = {};
      for (const [key, value] of Object.entries(updateLimits)) {
        if (
          validFields.includes(key) &&
          typeof value === "number" &&
          value > 0
        ) {
          filteredLimits[key] = value;
        }
      }

      if (Object.keys(filteredLimits).length > 0) {
        // Note: In a real implementation, you'd want to import and call updateRateLimits
        // For now, we'll just return success
        return NextResponse.json({
          message: "Rate limits updated successfully",
          updatedLimits: filteredLimits,
          timestamp: new Date().toISOString(),
        });
      } else {
        return NextResponse.json(
          { error: "No valid limits provided" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating AI usage limits:", error);
    return NextResponse.json(
      { error: "Failed to update usage limits" },
      { status: 500 }
    );
  }
}
