import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { SubAccountService } from "@/lib/district/sub-account-service";
import { Role } from "@prisma/client";

// GET /api/admin/sub-accounts - Get sub-accounts for the district admin
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      (user.role !== Role.DISTRICT_ADMIN && user.role !== Role.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const subAccounts = await SubAccountService.getSubAccountsForDistrictAdmin(
      user.id,
      organizationId
    );

    // Also get the ability to create more sub-accounts
    const canCreateInfo = await SubAccountService.canCreateSubAccount(
      user.id,
      organizationId
    );

    return NextResponse.json({
      subAccounts,
      canCreate: canCreateInfo.canCreate,
      currentCount: canCreateInfo.currentCount,
      maxAllowed: canCreateInfo.maxAllowed,
      reason: canCreateInfo.reason,
    });
  } catch (error) {
    console.error("Error fetching sub-accounts:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch sub-accounts",
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/sub-accounts - Create a new sub-account
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      (user.role !== Role.DISTRICT_ADMIN && user.role !== Role.ADMIN)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      organizationId,
      email,
      name,
      displayName,
      description,
      maxAssessments,
      maxUsers,
      password,
    } = body;

    if (!organizationId || !email || !name || !displayName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the district admin can create more sub-accounts
    const canCreateInfo = await SubAccountService.canCreateSubAccount(
      user.id,
      organizationId
    );

    if (!canCreateInfo.canCreate) {
      return NextResponse.json(
        { error: canCreateInfo.reason },
        { status: 403 }
      );
    }

    const subAccount = await SubAccountService.createSubAccount(
      user.id,
      organizationId,
      {
        email,
        name,
        displayName,
        description,
        maxAssessments,
        maxUsers,
        password,
      }
    );

    return NextResponse.json({
      success: true,
      subAccount,
      message: "Sub-account created successfully",
    });
  } catch (error) {
    console.error("Error creating sub-account:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create sub-account",
      },
      { status: 500 }
    );
  }
}
