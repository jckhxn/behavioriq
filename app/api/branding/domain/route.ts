import { NextRequest, NextResponse } from "next/server";
import { getOrganizationBranding } from "@/lib/branding/branding-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain");

  if (!domain) {
    return NextResponse.json(
      { error: "Domain parameter is required" },
      { status: 400 }
    );
  }

  const branding = await getOrganizationBranding(domain, "domain");

  return NextResponse.json({ branding });
}
