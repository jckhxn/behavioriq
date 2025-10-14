import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ credits: 0 }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json({ credits: 0 }, { status: 404 });
    }

    return NextResponse.json({ credits: user.credits ?? 0 });
  } catch (error) {
    console.error("Failed to fetch credits:", error);
    return NextResponse.json(
      { credits: 0, error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
