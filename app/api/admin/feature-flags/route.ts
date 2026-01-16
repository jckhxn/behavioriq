/**
 * Feature Flags Management API
 * GET /api/admin/feature-flags - List all feature flags
 * POST /api/admin/feature-flags - Create a new feature flag
 *
 * Only accessible by SUPER_ADMIN
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

async function requireSuperAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (dbUser?.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Super Admin access required");
  }

  return user;
}

export async function GET() {
  try {
    await requireSuperAdmin();

    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });

    return NextResponse.json({ flags });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error fetching feature flags:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();

    const body = await req.json();
    const {
      key,
      displayName,
      description,
      scope,
      isEnabled,
      enabledForRoles,
      enabledForOrgs,
      metadata,
    } = body;

    if (!key || !displayName) {
      return NextResponse.json(
        { error: "Key and displayName are required" },
        { status: 400 }
      );
    }

    // Check if flag already exists
    const existingFlag = await prisma.featureFlag.findUnique({
      where: { key },
    });

    if (existingFlag) {
      return NextResponse.json(
        { error: "Feature flag with this key already exists" },
        { status: 409 }
      );
    }

    const flag = await prisma.featureFlag.create({
      data: {
        key,
        displayName,
        description: description || null,
        scope: scope || "global",
        isEnabled: isEnabled ?? false,
        enabledForRoles: enabledForRoles || [],
        enabledForOrgs: enabledForOrgs || [],
        metadata: metadata || null,
      },
    });

    return NextResponse.json({ flag }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error creating feature flag:", error);
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 }
    );
  }
}
