import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db/prisma";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email || "",
        name: user.name || "",
      },
    });
  } catch (error) {
    console.error("[GET /api/user/profile] Error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name: string | undefined = body.name?.trim();

    if (name === undefined || name === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Write to Prisma (web app reads from here)
    await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });

    // Write to Supabase user_metadata (iOS app reads name from here via AuthService.mapUser)
    const { error: supabaseError } = await supabaseAdmin().auth.admin.updateUserById(
      user.id,
      { user_metadata: { name } }
    );

    if (supabaseError) {
      console.error("[PUT /api/user/profile] Supabase metadata update failed:", supabaseError);
      // Don't fail the request — Prisma write succeeded and web app will work.
      // iOS will pick up the change on next sign-in when metadata refreshes.
    }

    return NextResponse.json({ success: true, name });
  } catch (error) {
    console.error("[PUT /api/user/profile] Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
