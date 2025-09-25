import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { SubAccountService } from "@/lib/district/sub-account-service";
import { Role } from "@prisma/client";

// POST /api/admin/sub-accounts/[id]/reset-password - Reset sub-account password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { newPassword } = body;

    const generatedPassword = await SubAccountService.resetSubAccountPassword(
      id,
      session.user.id,
      newPassword
    );

    return NextResponse.json({
      success: true,
      password: generatedPassword,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to reset password",
      },
      { status: 500 }
    );
  }
}
