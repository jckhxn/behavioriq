import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the passkey belongs to the user
    const passkey = await prisma.passkey.findUnique({
      where: { id },
    });

    if (!passkey) {
      return NextResponse.json({ error: "Passkey not found" }, { status: 404 });
    }

    if (passkey.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the passkey
    await prisma.passkey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting passkey:", error);
    return NextResponse.json(
      { error: "Failed to delete passkey" },
      { status: 500 }
    );
  }
}
