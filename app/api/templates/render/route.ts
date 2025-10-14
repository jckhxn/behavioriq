import { NextResponse } from "next/server";
// import safe JSX renderer and engines here

// POST /api/templates/render - compile + render preview
export async function POST(req: Request) {
  // { jsx_source, props, type }
  // TODO: Use safe JSX renderer (esbuild/sandbox), Tailwind, and engines
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
