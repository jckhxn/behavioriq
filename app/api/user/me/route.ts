/**
 * GET /api/user/me
 *
 * Returns the current user's full data from the database
 * Used by client components via useUserData() hook
 */

import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

export async function GET() {
  try {
    console.log("🔍 /api/user/me - Fetching user data...");
    const user = await getCurrentUserWithRole();

    console.log("👤 User result:", user ? `Found: ${user.email}` : "Not found");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      organizationId: user.organizationId,
    });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
