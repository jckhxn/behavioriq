import { NextRequest, NextResponse } from "next/server";
import { loadAssessmentConfigs } from "@/lib/assessment/db-loader";

/**
 * GET /api/assessments/config
 * Returns all available assessment configurations from database
 */
export async function GET() {
  try {
    const assessments = await loadAssessmentConfigs();
    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error loading assessment configurations:", error);
    return NextResponse.json(
      { error: "Failed to load assessment configurations" },
      { status: 500 }
    );
  }
}
