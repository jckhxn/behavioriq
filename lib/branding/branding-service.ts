/**
 * Organization Branding Service
 *
 * Handles custom branding and white-label functionality for organizations
 */

import { prisma } from "@/lib/db/prisma";

export interface OrganizationBranding {
  id: string;
  name: string;
  customDomain?: string | null;
  logo?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  headerTitle?: string | null;
  footerText?: string | null;
}

export interface BrandingConfig {
  organizationName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  headerTitle: string;
  footerText: string;
}

/**
 * Get organization branding by domain or organization ID
 */
export async function getOrganizationBranding(
  identifier: string,
  identifierType: "domain" | "id" = "id"
): Promise<OrganizationBranding | null> {
  try {
    const whereClause =
      identifierType === "domain"
        ? { customDomain: identifier }
        : { id: identifier };

    const organization = await prisma.organization.findUnique({
      where: whereClause,
      select: {
        id: true,
        name: true,
        customDomain: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        headerTitle: true,
        footerText: true,
      },
    });

    return organization;
  } catch (error) {
    console.error("Error fetching organization branding:", error);
    return null;
  }
}

/**
 * Get branding configuration with fallbacks for an organization
 */
export async function getBrandingConfig(
  organizationId?: string
): Promise<BrandingConfig> {
  const defaultConfig: BrandingConfig = {
    organizationName: "AI Diagnostic",
    primaryColor: "#2563eb", // blue-600
    secondaryColor: "#64748b", // slate-500
    headerTitle: "AI Diagnostic System",
    footerText: "© 2024 AI Diagnostic. All rights reserved.",
  };

  if (!organizationId) {
    return defaultConfig;
  }

  try {
    const branding = await getOrganizationBranding(organizationId);

    if (!branding) {
      return defaultConfig;
    }

    return {
      organizationName: branding.name || defaultConfig.organizationName,
      logo: branding.logo || undefined,
      primaryColor: branding.primaryColor || defaultConfig.primaryColor,
      secondaryColor: branding.secondaryColor || defaultConfig.secondaryColor,
      headerTitle:
        branding.headerTitle || branding.name || defaultConfig.headerTitle,
      footerText: branding.footerText || defaultConfig.footerText,
    };
  } catch (error) {
    console.error("Error getting branding config:", error);
    return defaultConfig;
  }
}

/**
 * Update organization branding settings
 */
export async function updateOrganizationBranding(
  organizationId: string,
  branding: Partial<Omit<OrganizationBranding, "id" | "name">>
): Promise<OrganizationBranding | null> {
  try {
    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        customDomain: branding.customDomain,
        logo: branding.logo,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        headerTitle: branding.headerTitle,
        footerText: branding.footerText,
      },
      select: {
        id: true,
        name: true,
        customDomain: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        headerTitle: true,
        footerText: true,
      },
    });

    return updatedOrganization;
  } catch (error) {
    console.error("Error updating organization branding:", error);
    return null;
  }
}

/**
 * Check if a custom domain is available
 */
export async function isCustomDomainAvailable(
  domain: string,
  excludeOrgId?: string
): Promise<boolean> {
  try {
    const existing = await prisma.organization.findUnique({
      where: { customDomain: domain },
      select: { id: true },
    });

    if (!existing) {
      return true;
    }

    // If excluding an organization (for updates), check if it's the same org
    return excludeOrgId ? existing.id === excludeOrgId : false;
  } catch (error) {
    console.error("Error checking domain availability:", error);
    return false;
  }
}

/**
 * Generate CSS custom properties for organization branding
 */
export function generateBrandingCSS(config: BrandingConfig): string {
  return `
    :root {
      --brand-primary: ${config.primaryColor};
      --brand-secondary: ${config.secondaryColor};
      --brand-primary-rgb: ${hexToRgb(config.primaryColor)};
      --brand-secondary-rgb: ${hexToRgb(config.secondaryColor)};
    }
    
    .brand-primary { color: var(--brand-primary); }
    .brand-secondary { color: var(--brand-secondary); }
    .bg-brand-primary { background-color: var(--brand-primary); }
    .bg-brand-secondary { background-color: var(--brand-secondary); }
    .border-brand-primary { border-color: var(--brand-primary); }
    .border-brand-secondary { border-color: var(--brand-secondary); }
  `;
}

/**
 * Convert hex color to RGB string
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "37, 99, 235"; // Default blue-600

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ].join(", ");
}
