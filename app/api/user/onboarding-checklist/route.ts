import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const currentUser = await getCurrentUserWithRole();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        assessments: {
          take: 1,
        },
        chatSessions: {
          take: 1,
        },
      },
    });

    const items = [
      {
        id: "tour",
        label: "Complete dashboard tour",
        completed: user?.onboardingCompleted || false,
      },
      {
        id: "assessment",
        label: "Create your first assessment",
        completed: (user?.assessments?.length || 0) > 0,
      },
      {
        id: "chat",
        label: "Try AI chat",
        completed: (user?.chatSessions?.length || 0) > 0,
      },
      {
        id: "profile",
        label: "Complete your profile",
        completed: !!(user?.name && user?.email),
      },
    ];

    return NextResponse.json({
      items,
      dismissed: user?.onboardingSkipped || false,
    });
  } catch (error) {
    console.error("Error fetching checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 }
    );
  }
}

// POST /api/user/onboarding-checklist - Dismiss checklist permanently
export async function POST() {
  try {
    const currentUser = await getCurrentUserWithRole();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { onboardingSkipped: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error dismissing checklist:", error);
    return NextResponse.json(
      { error: "Failed to dismiss checklist" },
      { status: 500 }
    );
  }
}
