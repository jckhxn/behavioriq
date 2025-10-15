import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import React from "react";
import SimpleEmail from "@/components/admin/JSXEmailTemplates/SimpleEmail";

type RenderRequest = {
  name?: string; // template key/name
  subject: string;
  body: string; // raw HTML or text to insert
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: RenderRequest = await req.json();
    const name = payload.name || "default";

    if (!payload.subject) {
      return NextResponse.json({ error: "subject required" }, { status: 400 });
    }

    // Render the JSX component to static markup
    const element = React.createElement(SimpleEmail, {
      subject: payload.subject,
      body: payload.body || "",
    });

    const { renderToStaticMarkup } = await import("react-dom/server");
    const rendered = renderToStaticMarkup(element);

    // Wrap with a minimal HTML document for safety
    const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body>${rendered}</body></html>`;

    // Upsert the rendered HTML into the DB
    const template = await prisma.emailTemplate.upsert({
      where: { name },
      update: { subject: payload.subject, html },
      create: { name, subject: payload.subject, html },
    });

    return NextResponse.json({ ok: true, template });
  } catch (error) {
    console.error("[Email Templates Render API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to render template" },
      { status: 500 }
    );
  }
}
