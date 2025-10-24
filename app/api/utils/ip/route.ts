import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get IP from various header sources (in order of preference)
    const ip =
      request.headers.get("cf-connecting-ip") || // Cloudflare
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || // Standard proxy
      request.headers.get("x-real-ip") || // Nginx proxy
      request.headers.get("true-client-ip") || // Cloudflare Enterprise
      "unknown";

    return NextResponse.json({ ip });
  } catch (error) {
    console.error("[IP] Error:", error);
    return NextResponse.json({ ip: "unknown" });
  }
}
