import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 }
    );
  }
}
