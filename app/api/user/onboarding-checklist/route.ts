import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: "tour", label: "Complete dashboard tour", completed: false },
  { id: "assessment", label: "Create your first assessment", completed: false },
  { id: "chat", label: "Try AI chat", completed: false },
  { id: "profile", label: "Complete your profile", completed: false },
];

/**
 * GET /api/user/onboarding-checklist
 * Returns the user's onboarding checklist status
 * Stored in user metadata
 */
export async function GET() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get checklist from user metadata
    const metadata = user.user_metadata || {};
    const checklistDismissed = metadata.onboarding_checklist_dismissed || false;

    let items = DEFAULT_ITEMS;
    if (metadata.onboarding_checklist_items) {
      try {
        items = JSON.parse(metadata.onboarding_checklist_items);
      } catch {
        items = DEFAULT_ITEMS;
      }
    }

    return NextResponse.json({
      items,
      dismissed: checklistDismissed,
    });
  } catch (error) {
    console.error("[/api/user/onboarding-checklist] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding checklist" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/onboarding-checklist
 * Marks the checklist as dismissed
 * Note: This just returns success - actual persistence should be handled by client
 */
export async function POST() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // In a real implementation, you'd update the user's metadata here
    // For now, return success - the client can store this in localStorage
    return NextResponse.json({
      success: true,
      dismissed: true,
    });
  } catch (error) {
    console.error("[/api/user/onboarding-checklist] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding checklist" },
      { status: 500 }
    );
  }
}
