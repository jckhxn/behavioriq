"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Define BrandingConfig locally to avoid server-side imports
export interface BrandingConfig {
  organizationName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  headerTitle: string;
  footerText: string;
}

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (newBranding: BrandingConfig) => void;
  loading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(
  undefined
);

interface BrandingProviderProps {
  children: React.ReactNode;
  organizationId?: string;
  initialBranding?: BrandingConfig;
}

export function BrandingProvider({
  children,
  organizationId,
  initialBranding,
}: BrandingProviderProps) {
  const [branding, setBranding] = useState<BrandingConfig>(
    initialBranding || {
      organizationName: "AI Diagnostic",
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
      headerTitle: "AI Diagnostic System",
      footerText: "© 2024 AI Diagnostic. All rights reserved.",
    }
  );
  const [loading, setLoading] = useState(!initialBranding);

  useEffect(() => {
    if (!initialBranding && organizationId) {
      loadBranding();
    }
  }, [organizationId, initialBranding]);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/branding?organizationId=${organizationId}`
      );
      if (response.ok) {
        const data = await response.json();
        setBranding(data.config);
      }
    } catch (error) {
      console.error("Failed to load branding:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBranding = (newBranding: BrandingConfig) => {
    setBranding(newBranding);
  };

  // Inject CSS custom properties for branding
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      :root {
        --brand-primary: ${branding.primaryColor};
        --brand-secondary: ${branding.secondaryColor};
        --brand-primary-rgb: ${hexToRgb(branding.primaryColor)};
        --brand-secondary-rgb: ${hexToRgb(branding.secondaryColor)};
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [branding.primaryColor, branding.secondaryColor]);

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "37, 99, 235"; // Default blue-600

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ].join(", ");
}
