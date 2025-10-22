/**
 * Database Health Check API Endpoint
 *
 * Monitors critical database tables to ensure data integrity
 * Alerts if any critical table is empty (potential data loss)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";

interface TableCheck {
  table: string;
  count: number;
  status: "healthy" | "warning" | "critical";
  message?: string;
}

interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: TableCheck[];
  summary: {
    total: number;
    healthy: number;
    warnings: number;
    critical: number;
  };
}

/**
 * GET /api/admin/health/database
 *
 * Returns health status of all critical database tables
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUserWithRole();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only allow admin/super_admin access
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Check all critical tables
    const checks: TableCheck[] = [];

    // Licenses table - CRITICAL if empty
    const licensesCount = await prisma.license.count();
    checks.push({
      table: "licenses",
      count: licensesCount,
      status: licensesCount === 0 ? "critical" : "healthy",
      message: licensesCount === 0 ? "No licenses found - users cannot be assigned licenses!" : undefined,
    });

    // User Licenses table - WARNING if empty
    const userLicensesCount = await prisma.userLicense.count();
    checks.push({
      table: "user_licenses",
      count: userLicensesCount,
      status: userLicensesCount === 0 ? "warning" : "healthy",
      message: userLicensesCount === 0 ? "No user licenses assigned - users may not be able to access features" : undefined,
    });

    // Assessment Templates - CRITICAL if empty
    const assessmentTemplatesCount = await prisma.assessmentTemplate.count();
    checks.push({
      table: "assessment_templates",
      count: assessmentTemplatesCount,
      status: assessmentTemplatesCount === 0 ? "critical" : "healthy",
      message: assessmentTemplatesCount === 0 ? "No assessment templates - users cannot create assessments!" : undefined,
    });

    // Domain Templates - CRITICAL if empty
    const domainTemplatesCount = await prisma.domainTemplate.count();
    checks.push({
      table: "domain_templates",
      count: domainTemplatesCount,
      status: domainTemplatesCount === 0 ? "critical" : "healthy",
      message: domainTemplatesCount === 0 ? "No domain templates - assessments cannot be scored!" : undefined,
    });

    // Users table - should always have at least 1
    const usersCount = await prisma.user.count();
    checks.push({
      table: "users",
      count: usersCount,
      status: usersCount === 0 ? "critical" : "healthy",
      message: usersCount === 0 ? "No users in database!" : undefined,
    });

    // Assessments table - informational only
    const assessmentsCount = await prisma.assessment.count();
    checks.push({
      table: "assessments",
      count: assessmentsCount,
      status: "healthy",
    });

    // Payments table - informational only
    const paymentsCount = await prisma.payment.count();
    checks.push({
      table: "payments",
      count: paymentsCount,
      status: "healthy",
    });

    // Calculate summary
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === "healthy").length,
      warnings: checks.filter(c => c.status === "warning").length,
      critical: checks.filter(c => c.status === "critical").length,
    };

    // Determine overall status
    let overallStatus: "healthy" | "degraded" | "unhealthy";
    if (summary.critical > 0) {
      overallStatus = "unhealthy";
    } else if (summary.warnings > 0) {
      overallStatus = "degraded";
    } else {
      overallStatus = "healthy";
    }

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      summary,
    };

    // Return appropriate HTTP status code
    const httpStatus = overallStatus === "unhealthy" ? 503 : 200;

    return NextResponse.json(response, { status: httpStatus });

  } catch (error) {
    console.error("Database health check error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Failed to perform health check",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
