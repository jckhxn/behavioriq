import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { SubAccountService } from "@/lib/district/sub-account-service";
import { Role } from "@prisma/client";

// GET /api/admin/sub-accounts/[id] - Get specific sub-account details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      (session.user.role !== Role.DISTRICT_ADMIN &&
        session.user.role !== Role.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const subAccount = await SubAccountService.getSubAccountById(id);

    // Check if the user has permission to view this sub-account
    if (
      subAccount.user.id !== session.user.id &&
      session.user.role !== Role.ADMIN
    ) {
      // For district admins, check if they manage this sub-account
      // This would need additional logic to verify ownership
    }

    return NextResponse.json(subAccount);
  } catch (error) {
    console.error("Error fetching sub-account:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch sub-account",
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/sub-accounts/[id] - Update sub-account
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      (session.user.role !== Role.DISTRICT_ADMIN &&
        session.user.role !== Role.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { displayName, description, maxAssessments, maxUsers, isActive } =
      body;

    const updatedSubAccount = await SubAccountService.updateSubAccount(
      id,
      session.user.id,
      {
        displayName,
        description,
        maxAssessments,
        maxUsers,
        isActive,
      }
    );

    return NextResponse.json({
      success: true,
      subAccount: updatedSubAccount,
      message: "Sub-account updated successfully",
    });
  } catch (error) {
    console.error("Error updating sub-account:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update sub-account",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sub-accounts/[id] - Deactivate sub-account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      (session.user.role !== Role.DISTRICT_ADMIN &&
        session.user.role !== Role.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await SubAccountService.deactivateSubAccount(id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Sub-account deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating sub-account:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to deactivate sub-account",
      },
      { status: 500 }
    );
  }
}
