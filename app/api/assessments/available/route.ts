import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

// GET /api/assessments/available - Get active assessment templates for users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get only active assessment templates
    const activeAssessments = await prisma.assessmentTemplate.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        instructions: true,
        createdAt: true,
        domains: {
          select: {
            domainTemplate: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            order: true,
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            assessments: true, // Count how many users have taken this assessment
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(activeAssessments);
  } catch (error) {
    console.error("Error fetching available assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch available assessments" },
      { status: 500 }
    );
  }
}
