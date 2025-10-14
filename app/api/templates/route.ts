import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// GET /api/templates - list all templates
export async function GET() {
  const templates = await prisma.template.findMany();
  return NextResponse.json(templates);
}

// POST /api/templates - create a new template
export async function POST(req: Request) {
  const { name, type, jsx_source, default_props } = await req.json();
  const template = await prisma.template.create({
    data: { name, type, jsx_source, default_props },
  });
  return NextResponse.json(template);
}
