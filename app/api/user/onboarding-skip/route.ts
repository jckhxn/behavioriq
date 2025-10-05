import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingSkipped: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error skipping onboarding:", error);
    return NextResponse.json(
      { error: "Failed to skip onboarding" },
      { status: 500 }
    );
  }
}
