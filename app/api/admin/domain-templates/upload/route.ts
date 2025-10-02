import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

// POST /api/admin/domain-templates/upload - Upload domain template from JSON file
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(session.user.role)
    ) {
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
    let domainData;

    try {
      domainData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 });
    }

    // Validate domain data structure
    const validationResult = validateDomainTemplate(domainData);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: `Invalid domain template structure: ${validationResult.error}`,
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingDomain = await prisma.domainTemplate.findUnique({
      where: { slug: domainData.slug },
    });

    if (existingDomain) {
      return NextResponse.json(
        { error: `Domain with slug '${domainData.slug}' already exists` },
        { status: 409 }
      );
    }

    // Create the domain template
    const template = await prisma.domainTemplate.create({
      data: {
        name: domainData.name,
        slug: domainData.slug,
        description: domainData.description,
        questions: domainData.questions,
        resources: domainData.resources,
        scoringConfig: domainData.scoringConfig,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      message: "Domain template uploaded successfully",
      template,
    });
  } catch (error) {
    console.error("Error uploading domain template:", error);
    return NextResponse.json(
      { error: "Failed to upload domain template" },
      { status: 500 }
    );
  }
}

function validateDomainTemplate(data: any): { valid: boolean; error?: string } {
  // Required fields
  if (!data.name || typeof data.name !== "string") {
    return { valid: false, error: "Missing or invalid 'name' field" };
  }

  if (!data.slug || typeof data.slug !== "string") {
    return { valid: false, error: "Missing or invalid 'slug' field" };
  }

  if (!data.questions || !Array.isArray(data.questions)) {
    return { valid: false, error: "Missing or invalid 'questions' array" };
  }

  // Validate questions structure
  for (let i = 0; i < data.questions.length; i++) {
    const question = data.questions[i];
    if (!question.id || typeof question.id !== "string") {
      return {
        valid: false,
        error: `Question ${i + 1}: Missing or invalid 'id' field`,
      };
    }
    if (!question.text || typeof question.text !== "string") {
      return {
        valid: false,
        error: `Question ${i + 1}: Missing or invalid 'text' field`,
      };
    }
    if (!question.type || typeof question.type !== "string") {
      return {
        valid: false,
        error: `Question ${i + 1}: Missing or invalid 'type' field`,
      };
    }
  }

  // Optional fields validation
  if (data.description && typeof data.description !== "string") {
    return {
      valid: false,
      error: "Invalid 'description' field - must be string",
    };
  }

  if (data.resources && typeof data.resources !== "object") {
    return {
      valid: false,
      error: "Invalid 'resources' field - must be object",
    };
  }

  if (data.scoringConfig && typeof data.scoringConfig !== "object") {
    return {
      valid: false,
      error: "Invalid 'scoringConfig' field - must be object",
    };
  }

  return { valid: true };
}
