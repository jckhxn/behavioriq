import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { step } = await request.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingStep: step },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating onboarding progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
