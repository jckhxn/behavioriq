import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// GET /api/templates/:id - get one template
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const template = await prisma.template.findUnique({
    where: { id: params.id },
  });
  return NextResponse.json(template);
}

// POST /api/templates/:id - update JSX + props
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { jsx_source, default_props } = await req.json();
  const template = await prisma.template.update({
    where: { id: params.id },
    data: { jsx_source, default_props },
  });
  return NextResponse.json(template);
}
