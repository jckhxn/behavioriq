import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const count = await prisma.shareableLink.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
