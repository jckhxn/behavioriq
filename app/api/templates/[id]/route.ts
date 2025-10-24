import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/templates/:id - get one template
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = await prisma.assessmentTemplate.findUnique({
    where: { id },
  });
  return NextResponse.json(template);
}

// POST /api/templates/:id - update JSX + props
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, description, instructions, isActive, version } =
    await req.json();
  const template = await prisma.assessmentTemplate.update({
    where: { id },
    data: { name, description, instructions, isActive, version },
  });
  return NextResponse.json(template);
}
