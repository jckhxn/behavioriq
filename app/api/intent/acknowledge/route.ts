import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, action } = body;

    if (!studentId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get IP address from request headers
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Log the acknowledgment
    await prisma.intentAcknowledgment.create({
      data: {
        userId: user.id,
        studentId,
        action,
        ipAddress,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Intent acknowledgment error:", error);
    return NextResponse.json(
      { error: "Failed to log acknowledgment" },
      { status: 500 }
    );
  }
}
