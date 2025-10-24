import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// GET /api/templates - list all templates
export async function GET() {
  const templates = await prisma.assessmentTemplate.findMany();
  return NextResponse.json(templates);
}

// POST /api/templates - create a new template
export async function POST(req: Request) {
  const {
    name,
    slug,
    description,
    instructions,
    isActive,
    version,
    createdById,
  } = await req.json();
  if (!name || !slug || !createdById) {
    return NextResponse.json(
      { error: "Missing required fields: name, slug, createdById" },
      { status: 400 }
    );
  }
  const template = await prisma.assessmentTemplate.create({
    data: {
      name,
      slug,
      description,
      instructions,
      isActive,
      version,
      createdById,
    },
  });
  return NextResponse.json(template);
}
