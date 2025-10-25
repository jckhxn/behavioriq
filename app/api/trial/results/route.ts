import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getTrialTemplate } from "@/lib/trial/get-trial-template";
import { scoreTrialSnapshot } from "@/lib/trial/score-trial";

export type DomainScore = {
  name: string;
  score: number;
  screener: number;
  diagnostic: number;
};

export type TrialResultsResponse = {
  childLabel: string;
  age: number;
  completedAt: string;
  anonymous: boolean;
  domains: DomainScore[];
  subdomains: DomainScore[];
  flags: string[];
  sessionId: string;
};

/**
 * GET /api/trial/results?trialId={trialId}
 *
 * Returns formatted trial results for display on results page.
 * Transforms internal SnapshotResult to API contract format.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const trialId = url.searchParams.get("trialId");

    if (!trialId) {
      return NextResponse.json(
        { error: "trialId query parameter is required" },
        { status: 400 }
      );
    }

    // Fetch trial record with session data
    const trial = await prisma.assessmentTrial.findUnique({
      where: { id: trialId },
      include: { session: true },
    });

    if (!trial) {
      return NextResponse.json(
        { error: "Trial not found" },
        { status: 404 }
      );
    }

    // Parse scoreSnapshot JSON
    if (!trial.scoreSnapshot) {
      return NextResponse.json(
        { error: "Trial has not been scored yet" },
        { status: 400 }
      );
    }

    let parsedSnapshot;
    try {
      parsedSnapshot =
        typeof trial.scoreSnapshot === "string"
          ? JSON.parse(trial.scoreSnapshot)
          : trial.scoreSnapshot;
    } catch {
      return NextResponse.json(
        { error: "Invalid score snapshot data" },
        { status: 500 }
      );
    }

    // Transform internal format to API format
    const formattedDomains = transformDomainsToApiFormat(
      parsedSnapshot.domains || []
    );

    // Generate child label
    let childLabel = "Child";
    if (!trial.session.anonymous && trial.childFirstName) {
      childLabel = trial.childFirstName;
    } else if (trial.session.anonymous) {
      // Generate anonymous code (e.g., "ABC123")
      childLabel = `Code ${generateAnonymousCode(trial.id)}`;
    }

    // Parse age from ageBand (e.g., "6-8" -> 7)
    const age = parseAgeFromBand(trial.ageBand || "6-8");

    // Get elevated domains for flags
    const flags = formattedDomains
      .filter((d) => d.score >= 70) // Elevated threshold
      .map((d) => d.name);

    const response: TrialResultsResponse = {
      childLabel,
      age,
      completedAt: trial.createdAt.toISOString(),
      anonymous: trial.session.anonymous || false,
      domains: formattedDomains.slice(0, 4), // Overall domains
      subdomains: formattedDomains.slice(4, 8), // Specific areas
      flags,
      sessionId: trial.sessionId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[trial/results] failed", error);
    return NextResponse.json(
      { error: "Unable to load trial results" },
      { status: 500 }
    );
  }
}

/**
 * Transform internal SnapshotDomain format to API DomainScore format
 * Adds synthetic screener and diagnostic thresholds
 */
function transformDomainsToApiFormat(
  domains: Array<{ domain: string; slug: string; score: number; level: string }>
): DomainScore[] {
  return domains.map((domain) => {
    // Score is already 0-4 scale, convert to 0-100
    const score100 = Math.round((domain.score / 4) * 100);

    // Synthetic reference thresholds (these would come from your assessment design)
    // Screener cutoff: ~60 (typical screening threshold)
    // Diagnostic reference: ~75 (clinical significance threshold)
    const screenerCutoff = 60;
    const diagnosticRef = 75;

    return {
      name: domain.domain,
      score: score100,
      screener: screenerCutoff,
      diagnostic: diagnosticRef,
    };
  });
}

/**
 * Generate a unique anonymous code from trial ID
 * E.g., "abc123def456" -> "ABC123"
 */
function generateAnonymousCode(trialId: string): string {
  // Use first 6 characters of trial ID, uppercase
  return trialId.substring(0, 6).toUpperCase();
}

/**
 * Parse age from age band
 * E.g., "6-8" -> 7 (midpoint), "13-18" -> 15.5 -> 16
 */
function parseAgeFromBand(ageBand: string): number {
  const [min, max] = ageBand.split("-").map(Number);
  if (!min || !max) return 10; // Default fallback
  return Math.round((min + max) / 2);
}
