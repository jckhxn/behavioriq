import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUserWithRole();

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId, title, body, data } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: "userId, title, and body are required" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notification = await prisma.pushNotification.create({
      data: { userId, title, body, data: data ?? undefined },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("[admin/notifications] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentUserWithRole();

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const notifications = await prisma.pushNotification.findMany({
      take: limit,
      orderBy: { sentAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("[admin/notifications] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
