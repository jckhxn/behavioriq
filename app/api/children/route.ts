import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { z } from "zod";

const createChildSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  birthdate: z
    .string()
    .trim()
    .nullable()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      "Birthdate must be a valid date"
    ),
  gradeband: z.string().trim().max(50).nullable().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const children = await prisma.childProfile.findMany({
      where: { userid: user.id },
      orderBy: { createdat: "asc" },
      include: {
        assessments: {
          select: {
            id: true,
            status: true,
            subjectName: true,
            completedAt: true,
            startedAt: true,
          },
        },
      },
    });

    return NextResponse.json(children);
  } catch (error) {
    console.error("[children] GET error", error);
    return NextResponse.json(
      { error: "Failed to load child profiles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawPayload = await req.json();
    const parsed = createChildSchema.safeParse(rawPayload);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? "Invalid payload";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const birthdate =
      parsed.data.birthdate && parsed.data.birthdate.length > 0
        ? new Date(parsed.data.birthdate)
        : null;

    const child = await prisma.childProfile.create({
      data: {
        userid: user.id,
        name: parsed.data.name,
        birthdate,
        gradeband: parsed.data.gradeband ?? null,
      },
      include: {
        assessments: {
          select: {
            id: true,
            status: true,
            subjectName: true,
            completedAt: true,
            startedAt: true,
          },
        },
      },
    });

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error("[children] POST error", error);
    return NextResponse.json(
      { error: "Failed to create child profile" },
      { status: 500 }
    );
  }
}
