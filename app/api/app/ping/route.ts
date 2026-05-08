import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Called by the iOS app on connect to mark the user as having the app active.
// Body: { supabaseUserId: string }
// Auth: Bearer <supabase access token> (used to gate the call, not decoded here)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { supabaseUserId } = await request.json();
    if (!supabaseUserId) {
      return NextResponse.json({ error: "Missing supabaseUserId" }, { status: 400 });
    }

    // Resolve Supabase UUID → email → our users row
    const authRows = await prisma.$queryRaw<{ email: string }[]>`
      SELECT email FROM auth.users WHERE id = ${supabaseUserId}::uuid LIMIT 1
    `;

    if (!authRows[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.updateMany({
      where: { email: authRows[0].email },
      data: { iosAppLastSeen: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[app/ping] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
