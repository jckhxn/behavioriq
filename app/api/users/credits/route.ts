import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();

    if (!user?.id) {
      return NextResponse.json({ credits: 0 }, { status: 401 });
    }

    const creditsValue =
      typeof user.credits === "number"
        ? user.credits
        : user.credits === null
        ? 0
        : undefined;

    if (creditsValue !== undefined) {
      return NextResponse.json({ credits: creditsValue });
    }

    // Fallback to Prisma query if credits not included in Supabase payload
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });

    return NextResponse.json({ credits: dbUser?.credits ?? 0 });
  } catch (error) {
    console.error("Failed to fetch credits:", error);
    return NextResponse.json(
      { credits: 0, error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
