import { NextRequest, NextResponse } from "next/server";
import { loadAssessmentByDomain } from "@/lib/assessment/db-loader";
import { AssessmentDomain } from "@prisma/client";

/**
 * GET /api/assessments/config/[domain]
 * Returns assessment configuration for a specific domain from database
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain: domainParam } = await params;

  try {
    const domain = domainParam.toUpperCase() as AssessmentDomain;

    // Validate domain
    if (!Object.values(AssessmentDomain).includes(domain)) {
      return NextResponse.json(
        { error: "Invalid assessment domain" },
        { status: 400 }
      );
    }

    const assessment = await loadAssessmentByDomain(domain);

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error(
      `Error loading assessment configuration for domain ${domainParam}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to load assessment configuration" },
      { status: 500 }
    );
  }
}
