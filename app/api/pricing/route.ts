import { NextResponse } from "next/server";
import { getPricingPayload } from "@/lib/services/pricing-service";

export async function GET() {
  try {
    const payload = getPricingPayload();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[pricing] GET error", error);
    return NextResponse.json(
      { error: "Failed to load pricing" },
      { status: 500 }
    );
  }
}
