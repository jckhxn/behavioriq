import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import { generateUniqueShareCode } from "@/lib/utils/shareCode";
import { resolveAssessmentId } from "@/lib/utils/assessmentResolver";

// GET /api/share - Get all shareable links
export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shareableLinks = await prisma.shareableLink.findMany({
      where: { createdById: user.id },
      include: {
        assessment: {
          select: {
            id: true,
            shortId: true,
            subjectName: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(shareableLinks);
  } catch (error) {
    console.error("Get share links error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shareable links" },
      { status: 500 }
    );
  }
}

// POST /api/share - Create a new shareable link
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentId, privacy = "PRIVATE", password, expiresAt } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Verify the user owns the assessment
    const internalAssessmentId = await resolveAssessmentId(
      assessmentId,
      user.id
    );

    if (!internalAssessmentId) {
      return NextResponse.json(
        { error: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    // Validate password if privacy is PASSWORD_PROTECTED
    if (privacy === "PASSWORD_PROTECTED" && !password) {
      return NextResponse.json(
        { error: "Password is required for password-protected links" },
        { status: 400 }
      );
    }

    // Generate unique share code
    const shareCodeExists = async (code: string): Promise<boolean> => {
      const existing = await prisma.shareableLink.findUnique({
        where: { shareCode: code },
        select: { id: true },
      });
      return !!existing;
    };

    const shareCode = await generateUniqueShareCode(shareCodeExists);

    const shareableLink = await prisma.shareableLink.create({
      data: {
        shareCode,
        assessmentId: internalAssessmentId,
        createdById: user.id,
        privacy,
        password: privacy === "PASSWORD_PROTECTED" ? password : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        assessment: {
          select: {
            id: true,
            shortId: true,
            subjectName: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: shareableLink.id,
      shareCode: shareableLink.shareCode,
      shareUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/share/${shareableLink.shareCode}`,
      privacy: shareableLink.privacy,
      expiresAt: shareableLink.expiresAt,
      assessment: shareableLink.assessment,
      createdAt: shareableLink.createdAt,
    });
  } catch (error) {
    console.error("Create share link error:", error);
    return NextResponse.json(
      { error: "Failed t    eate shareable link" },
      { status: 500 }
    );
  }
}
