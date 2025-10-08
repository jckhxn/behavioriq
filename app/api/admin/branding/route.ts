import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import {
  getOrganizationBranding,
  updateOrganizationBranding,
  getBrandingConfig,
  isCustomDomainAvailable,
} from "@/lib/branding/branding-service";

// GET /api/admin/branding - Get organization branding settings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const branding = await getOrganizationBranding(organizationId);
    const config = await getBrandingConfig(organizationId);

    return NextResponse.json({
      branding,
      config,
    });
  } catch (error) {
    console.error("Error fetching branding:", error);
    return NextResponse.json(
      { error: "Failed to fetch branding" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/branding - Update organization branding settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (
      !user ||
      !["ADMIN", "SUPER_ADMIN", "DISTRICT_ADMIN"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, branding } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Validate custom domain if provided
    if (branding.customDomain) {
      const isAvailable = await isCustomDomainAvailable(
        branding.customDomain,
        organizationId
      );
      if (!isAvailable) {
        return NextResponse.json(
          { error: "Custom domain is already in use" },
          { status: 409 }
        );
      }

      // Basic domain validation
      const domainRegex =
        /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(branding.customDomain)) {
        return NextResponse.json(
          { error: "Invalid domain format" },
          { status: 400 }
        );
      }
    }

    // Validate colors if provided
    if (branding.primaryColor && !isValidHexColor(branding.primaryColor)) {
      return NextResponse.json(
        { error: "Invalid primary color format" },
        { status: 400 }
      );
    }

    if (branding.secondaryColor && !isValidHexColor(branding.secondaryColor)) {
      return NextResponse.json(
        { error: "Invalid secondary color format" },
        { status: 400 }
      );
    }

    const updatedBranding = await updateOrganizationBranding(
      organizationId,
      branding
    );

    if (!updatedBranding) {
      return NextResponse.json(
        { error: "Failed to update branding" },
        { status: 500 }
      );
    }

    const config = await getBrandingConfig(organizationId);

    return NextResponse.json({
      branding: updatedBranding,
      config,
    });
  } catch (error) {
    console.error("Error updating branding:", error);
    return NextResponse.json(
      { error: "Failed to update branding" },
      { status: 500 }
    );
  }
}

// Helper function to validate hex color codes
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}
