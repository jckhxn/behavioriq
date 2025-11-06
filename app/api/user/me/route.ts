import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

/**
 * GET /api/user/me
 * Returns the current authenticated user's data
 * Used by useUserData() hook to hydrate the dashboard
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

    // Return user data in format expected by useUserData()
    return NextResponse.json({
      id: user.id,
      email: user.email || "",
      name: user.name || user.email?.split("@")[0] || "User",
      role: user.role || "user",
      createdAt: user.created_at || new Date(),
      avatarUrl: user.user_metadata?.avatar_url || null,
      organizationId: null,
    });
  } catch (error) {
    console.error("[/api/user/me] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
