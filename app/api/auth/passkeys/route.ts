import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const passkeys = await prisma.passkey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        lastUsed: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ passkeys });
  } catch (error) {
    console.error("Error fetching passkeys:", error);
    return NextResponse.json(
      { error: "Failed to fetch passkeys" },
      { status: 500 }
    );
  }
}
