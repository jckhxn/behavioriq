import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

// POST /api/admin/assessment-templates/upload - Upload assessment template from JSON file
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".json")) {
      return NextResponse.json(
        { error: "File must be a JSON file" },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    let assessmentData;

    try {
      assessmentData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 });
    }

    // Validate assessment data structure
    const validationResult = validateAssessmentTemplate(assessmentData);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: `Invalid assessment template structure: ${validationResult.error}`,
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingAssessment = await prisma.assessmentTemplate.findUnique({
      where: { slug: assessmentData.slug },
    });

    if (existingAssessment) {
      return NextResponse.json(
        {
          error: `Assessment with slug '${assessmentData.slug}' already exists`,
        },
        { status: 409 }
      );
    }

    // Validate that all referenced domains exist
    const domainSlugs = assessmentData.domains || [];
    const existingDomains = await prisma.domainTemplate.findMany({
      where: { slug: { in: domainSlugs } },
      select: { id: true, slug: true },
    });

    if (existingDomains.length !== domainSlugs.length) {
      const foundSlugs = existingDomains.map((d) => d.slug);
      const missingSlugs = domainSlugs.filter(
        (slug: string) => !foundSlugs.includes(slug)
      );
      return NextResponse.json(
        { error: `Referenced domains not found: ${missingSlugs.join(", ")}` },
        { status: 400 }
      );
    }

    // Create the assessment template
    const template = await prisma.assessmentTemplate.create({
      data: {
        name: assessmentData.name,
        slug: assessmentData.slug,
        description: assessmentData.description,
        instructions: assessmentData.instructions,
        isActive:
          assessmentData.isActive !== undefined
            ? assessmentData.isActive
            : true,
        createdById: session.user.id,
        domains: {
          create: existingDomains.map((domain, index) => ({
            domainTemplateId: domain.id,
            order: index,
          })),
        },
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
        domains: {
          include: {
            domainTemplate: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Assessment template uploaded successfully",
      template,
    });
  } catch (error) {
    console.error("Error uploading assessment template:", error);
    return NextResponse.json(
      { error: "Failed to upload assessment template" },
      { status: 500 }
    );
  }
}

function validateAssessmentTemplate(data: any): {
  valid: boolean;
  error?: string;
} {
  // Required fields
  if (!data.name || typeof data.name !== "string") {
    return { valid: false, error: "Missing or invalid 'name' field" };
  }

  if (!data.slug || typeof data.slug !== "string") {
    return { valid: false, error: "Missing or invalid 'slug' field" };
  }

  if (!data.domains || !Array.isArray(data.domains)) {
    return { valid: false, error: "Missing or invalid 'domains' array" };
  }

  if (data.domains.length === 0) {
    return { valid: false, error: "Assessment must have at least one domain" };
  }

  // Validate domain slugs
  for (let i = 0; i < data.domains.length; i++) {
    const domainSlug = data.domains[i];
    if (!domainSlug || typeof domainSlug !== "string") {
      return { valid: false, error: `Domain ${i + 1}: Invalid domain slug` };
    }
  }

  // Optional fields validation
  if (data.description && typeof data.description !== "string") {
    return {
      valid: false,
      error: "Invalid 'description' field - must be string",
    };
  }

  if (data.instructions && typeof data.instructions !== "string") {
    return {
      valid: false,
      error: "Invalid 'instructions' field - must be string",
    };
  }

  if (data.isActive !== undefined && typeof data.isActive !== "boolean") {
    return {
      valid: false,
      error: "Invalid 'isActive' field - must be boolean",
    };
  }

  return { valid: true };
}
