import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/templates/:id - get one template
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = await prisma.template.findUnique({
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
  const { jsx_source, default_props } = await req.json();
  const template = await prisma.template.update({
    where: { id },
    data: { jsx_source, default_props },
  });
  return NextResponse.json(template);
}
