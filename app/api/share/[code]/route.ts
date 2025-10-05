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

    // Handle privacy settings
    if (shareableLink.privacy === "PRIVATE") {
      // PRIVATE means only accessible by the user who created the assessment
      const session = await auth();

      if (!session?.user?.id) {
        return NextResponse.json(
          {
            error: "This is a private assessment. Please log in to view.",
            requiresAuth: true,
          },
          { status: 401 }
        );
      }

      // Check if the current user is the owner of the assessment
      if (session.user.id !== shareableLink.createdById) {
        return NextResponse.json(
          {
            error:
              "You don't have permission to view this assessment. Only the creator can access private assessments.",
            requiresAuth: true,
          },
          { status: 403 }
        );
      }
    }

    // PUBLIC links don't require any additional checks - accessible by anyone with the link

    // If action is 'view', increment view count and return full assessment data
    if (action === "view") {
      // Handle password protection only for view requests
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

      await prisma.shareableLink.update({
        where: { id: shareableLink.id },
        data: { viewCount: { increment: 1 } },
      });

      return NextResponse.json({
        id: shareableLink.id,
        shareCode: shareableLink.shareCode,
        privacy: shareableLink.privacy,
        isActive: shareableLink.isActive,
        expiresAt: shareableLink.expiresAt,
        viewCount: shareableLink.viewCount + 1,
        assessment: {
          id: shareableLink.assessment.shortId || shareableLink.assessment.id,
          subjectName: shareableLink.assessment.subjectName,
          status: shareableLink.assessment.status,
          createdAt: shareableLink.assessment.startedAt,
          updatedAt:
            shareableLink.assessment.completedAt ||
            shareableLink.assessment.startedAt,
          scores: shareableLink.assessment.scores,
          responses: shareableLink.assessment.responses,
          hasEnhancedReport: shareableLink.assessment.hasEnhancedReport,
          enhancedReportPurchasedAt:
            shareableLink.assessment.enhancedReportPurchasedAt,
          childResponses: shareableLink.assessment.childResponses,
          enhancedAnalysis: shareableLink.assessment.enhancedAnalysis,
        },
        createdAt: shareableLink.createdAt,
        createdBy:
          shareableLink.createdBy.name || shareableLink.createdBy.email,
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
    const { privacy, password, isActive, expiresAt } = body;

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
        ...(privacy !== undefined && { privacy }),
        ...(password !== undefined && { password }),
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
