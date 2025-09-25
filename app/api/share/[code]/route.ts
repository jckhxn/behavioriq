import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

// GET /api/share/[code] - Get shareable link details or access shared assessment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    const action = searchParams.get("action"); // 'view' for accessing content, default for link info

    const shareableLink = await prisma.shareableLink.findUnique({
      where: { shareCode: code },
      include: {
        assessment: {
          include: {
            scores: true,
            responses: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!shareableLink) {
      return NextResponse.json(
        { error: "Shareable link not found" },
        { status: 404 }
      );
    }

    // Check if link is active
    if (!shareableLink.isActive) {
      return NextResponse.json(
        { error: "This link has been deactivated" },
        { status: 410 } // Gone
      );
    }

    // Check if link has expired
    if (shareableLink.expiresAt && shareableLink.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This link has expired" },
        { status: 410 } // Gone
      );
    }

    // Handle password protection
    if (shareableLink.privacy === "PASSWORD_PROTECTED") {
      if (!password) {
        return NextResponse.json(
          {
            error: "Password required",
            requiresPassword: true,
          },
          { status: 401 }
        );
      }

      if (password !== shareableLink.password) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Handle privacy settings for non-public links
    if (shareableLink.privacy === "PRIVATE") {
      // PRIVATE means accessible by anyone with the link, but not discoverable
      // No additional authentication required - the share code itself is the access control
      // Note: If you want to restrict to owner only, that would be a different privacy level
    }

    // If action is 'view', increment view count and return full assessment data
    if (action === "view") {
      await prisma.shareableLink.update({
        where: { id: shareableLink.id },
        data: { viewCount: { increment: 1 } },
      });

      return NextResponse.json({
        assessment: {
          id: shareableLink.assessment.shortId || shareableLink.assessment.id,
          subjectName: shareableLink.assessment.subjectName,
          status: shareableLink.assessment.status,
          startedAt: shareableLink.assessment.startedAt,
          completedAt: shareableLink.assessment.completedAt,
          scores: shareableLink.assessment.scores,
          responses: shareableLink.assessment.responses,
        },
        shareInfo: {
          shareCode: shareableLink.shareCode,
          privacy: shareableLink.privacy,
          viewCount: shareableLink.viewCount + 1,
          createdAt: shareableLink.createdAt,
          createdBy:
            shareableLink.createdBy.name || shareableLink.createdBy.email,
        },
      });
    }

    // Otherwise, return link metadata only
    return NextResponse.json({
      id: shareableLink.id,
      shareCode: shareableLink.shareCode,
      privacy: shareableLink.privacy,
      requiresPassword: shareableLink.privacy === "PASSWORD_PROTECTED",
      expiresAt: shareableLink.expiresAt,
      isActive: shareableLink.isActive,
      viewCount: shareableLink.viewCount,
      assessment: {
        id: shareableLink.assessment.shortId || shareableLink.assessment.id,
        subjectName: shareableLink.assessment.subjectName,
        status: shareableLink.assessment.status,
      },
      createdAt: shareableLink.createdAt,
      createdBy: shareableLink.createdBy.name || shareableLink.createdBy.email,
    });
  } catch (error) {
    console.error("Get share link error:", error);
    return NextResponse.json(
      { error: "Failed to access shareable link" },
      { status: 500 }
    );
  }
}

// PUT /api/share/[code] - Update shareable link (only by creator)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;
    const body = await request.json();
    const { isActive, expiresAt } = body;

    // Verify the user owns the shareable link
    const shareableLink = await prisma.shareableLink.findUnique({
      where: { shareCode: code },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!shareableLink) {
      return NextResponse.json(
        { error: "Shareable link not found" },
        { status: 404 }
      );
    }

    if (shareableLink.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update the shareable link
    const updatedLink = await prisma.shareableLink.update({
      where: { id: shareableLink.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(expiresAt !== undefined && {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
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
      id: updatedLink.id,
      shareCode: updatedLink.shareCode,
      shareUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/share/${updatedLink.shareCode}`,
      privacy: updatedLink.privacy,
      expiresAt: updatedLink.expiresAt,
      isActive: updatedLink.isActive,
      viewCount: updatedLink.viewCount,
      assessment: updatedLink.assessment,
      createdAt: updatedLink.createdAt,
      updatedAt: updatedLink.updatedAt,
    });
  } catch (error) {
    console.error("Update share link error:", error);
    return NextResponse.json(
      { error: "Failed to update shareable link" },
      { status: 500 }
    );
  }
}

// DELETE /api/share/[code] - Delete shareable link (only by creator)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;

    // Verify the user owns the shareable link
    const shareableLink = await prisma.shareableLink.findUnique({
      where: { shareCode: code },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!shareableLink) {
      return NextResponse.json(
        { error: "Shareable link not found" },
        { status: 404 }
      );
    }

    if (shareableLink.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the shareable link
    await prisma.shareableLink.delete({
      where: { id: shareableLink.id },
    });

    return NextResponse.json({
      message: "Shareable link deleted successfully",
    });
  } catch (error) {
    console.error("Delete share link error:", error);
    return NextResponse.json(
      { error: "Failed to delete shareable link" },
      { status: 500 }
    );
  }
}
