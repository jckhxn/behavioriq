import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { randomUUID } from "crypto";

/**
 * GET /api/admin/email-templates
 * Returns all email templates
 */
export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUserWithRole();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[Email Templates API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email-templates
 * Create or update an email template
 */
export async function POST(req: Request) {
  try {
    // Check authentication
    const user = await getCurrentUserWithRole();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, html, name = "default", body = "" } = await req.json();

    if (!subject || !html) {
      return NextResponse.json(
        { error: "Subject and HTML content are required" },
        { status: 400 }
      );
    }

    // Upsert the email template
    const template = await prisma.emailTemplate.upsert({
      where: { name },
      update: {
        subject,
        html,
        type: "GENERIC",
        updatedAt: new Date(),
      },
      create: {
        id: randomUUID(),
        name,
        subject,
        html,
        type: "GENERIC",
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        createdBy: { connect: { id: user.id } },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("[Email Templates API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to save email template" },
      { status: 500 }
    );
  }
}
