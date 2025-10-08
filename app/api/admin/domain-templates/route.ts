import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { prisma } from "@/lib/db/prisma";

// GET /api/admin/domain-templates - Get all domain templates
export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build where clause based on user role
    let whereClause = {};
    if (user.role === "DISTRICT_ADMIN") {
      // District admins can only see domain templates they created
      whereClause = { createdById: user.id };
    }
    // SUPER_ADMIN and ADMIN can see all domain templates

    const templates = await prisma.domainTemplate.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        _count: {
          select: { assessmentTemplates: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching domain templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch domain templates" },
      { status: 500 }
    );
  }
}

// POST /api/admin/domain-templates - Create new domain template
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug, description, questions, resources, scoringConfig } =
      await request.json();

    if (!name || !slug || !questions) {
      return NextResponse.json(
        { error: "Name, slug, and questions are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingDomain = await prisma.domainTemplate.findUnique({
      where: { slug },
    });

    if (existingDomain) {
      return NextResponse.json(
        { error: "Domain with this slug already exists" },
        { status: 409 }
      );
    }

    const template = await prisma.domainTemplate.create({
      data: {
        name,
        slug,
        description,
        questions,
        resources,
        scoringConfig,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating domain template:", error);
    return NextResponse.json(
      { error: "Failed to create domain template" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/domain-templates - Update domain template
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, slug, description, questions, resources, scoringConfig } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Domain template ID is required" },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current domain)
    if (slug) {
      const existingDomain = await prisma.domainTemplate.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existingDomain) {
        return NextResponse.json(
          { error: "Domain with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const template = await prisma.domainTemplate.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        questions,
        resources,
        scoringConfig,
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating domain template:", error);
    return NextResponse.json(
      { error: "Failed to update domain template" },
      { status: 500 }
    );
  }
}
