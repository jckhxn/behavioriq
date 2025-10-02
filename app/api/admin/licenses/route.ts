/**
 * License Management API
 *
 * Handles license validation, assignment, and management
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { LicensingService } from "@/lib/licensing/licensing-service";
import { prisma } from "@/lib/db/prisma";

// GET /api/admin/licenses - Get all licenses (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (organizationId) {
      const licenses =
        await LicensingService.getOrganizationLicenses(organizationId);
      return NextResponse.json({ licenses });
    }

    // Get all licenses for admin view
    const licenses = await prisma.license.findMany({
      include: {
        organization: {
          select: { id: true, name: true },
        },
        users: {
          where: { isActive: true },
          include: {
            user: {
              select: { id: true, name: true, email: true, lastLoginAt: true },
            },
          },
        },
        _count: {
          select: { users: { where: { isActive: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ licenses });
  } catch (error) {
    console.error("License fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}

// POST /api/admin/licenses - Create new license
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, maxUsers, validUntil, organizationId, features } = body;

    // Valid license types
    const validTypes = ["TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        {
          error:
            "Valid license type is required (TRIAL, BASIC, PROFESSIONAL, ENTERPRISE)",
        },
        { status: 400 }
      );
    }

    const license = await LicensingService.createLicense({
      type,
      maxUsers: maxUsers || 1,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      organizationId,
      features,
    });

    return NextResponse.json(
      {
        license,
        message: "License created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("License creation error:", error);
    return NextResponse.json(
      { error: "Failed to create license" },
      { status: 500 }
    );
  }
}
