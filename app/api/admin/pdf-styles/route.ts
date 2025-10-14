import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

/**
 * GET /api/admin/pdf-styles
 * Returns all PDF styles (usually just one "default")
 */
export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUserWithRole();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const styles = await prisma.pDFStyle.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(styles);
  } catch (error) {
    console.error("[PDF Styles API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch PDF styles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pdf-styles
 * Create or update a PDF style
 */
export async function POST(req: Request) {
  try {
    // Check authentication
    const user = await getCurrentUserWithRole();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name = "default", css } = await req.json();

    if (!css || typeof css !== "string") {
      return NextResponse.json(
        { error: "CSS content is required" },
        { status: 400 }
      );
    }

    // Upsert the PDF style
    const style = await prisma.pDFStyle.upsert({
      where: { name },
      update: { css },
      create: { name, css },
    });

    return NextResponse.json(style);
  } catch (error) {
    console.error("[PDF Styles API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to save PDF style" },
      { status: 500 }
    );
  }
}
