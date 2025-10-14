import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { NotificationService } from "@/lib/services/notification-service";

/**
 * GET /api/user/notification-preferences
 *
 * Returns the current user's notification preferences
 */
export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user's notification preferences
    const preferences = await NotificationService.getPreferences(user.id);

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("[API] Error fetching notification preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notification preferences",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/notification-preferences
 *
 * Updates the current user's notification preferences
 */
export async function PUT(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate that at least one preference is being updated
    const validFields = [
      "assessmentComplete",
      "assessmentShared",
      "licenseExpiring",
      "licenseRenewed",
      "newRecommendation",
      "weeklySummary",
      "monthlySummary",
      "accountUpdate",
      "securityAlert",
      "productUpdates",
      "marketingEmails",
    ];

    const updates: Record<string, boolean> = {};
    let hasValidUpdate = false;

    for (const field of validFields) {
      if (field in body) {
        if (typeof body[field] !== "boolean") {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid value for ${field}: must be a boolean`,
            },
            { status: 400 }
          );
        }
        updates[field] = body[field];
        hasValidUpdate = true;
      }
    }

    if (!hasValidUpdate) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid preference fields provided",
        },
        { status: 400 }
      );
    }

    // Update preferences
    const updatedPreferences = await NotificationService.updatePreferences(
      user.id,
      updates
    );

    return NextResponse.json({
      success: true,
      data: updatedPreferences,
      message: "Notification preferences updated successfully",
    });
  } catch (error) {
    console.error("[API] Error updating notification preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update notification preferences",
      },
      { status: 500 }
    );
  }
}
