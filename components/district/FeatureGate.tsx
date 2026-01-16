"use client";

import { ReactNode } from "react";
import { Role } from "@prisma/client";

interface FeatureGateProps {
  /**
   * The feature flag key to check
   */
  flagKey: string;

  /**
   * Whether the feature is enabled (computed server-side or client-side)
   */
  isEnabled: boolean;

  /**
   * Content to show when feature is enabled
   */
  children: ReactNode;

  /**
   * Optional fallback content when feature is disabled
   */
  fallback?: ReactNode;

  /**
   * Whether to hide completely (vs showing fallback)
   */
  hideWhenDisabled?: boolean;
}

/**
 * Client-side component to conditionally render based on feature flags
 *
 * @example
 * <FeatureGate flagKey="ai_recommendations" isEnabled={flags.ai_recommendations}>
 *   <AIRecommendations />
 * </FeatureGate>
 */
export function FeatureGate({
  isEnabled,
  children,
  fallback,
  hideWhenDisabled = false,
}: FeatureGateProps) {
  if (isEnabled) {
    return <>{children}</>;
  }

  if (hideWhenDisabled) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return null;
}

interface FeatureGuardProps {
  /**
   * The feature flag key being checked
   */
  flagKey: string;

  /**
   * Whether the feature is enabled
   */
  isEnabled: boolean;

  /**
   * Message to show when feature is disabled
   */
  disabledMessage?: string;
}

/**
 * Shows a disabled state UI when feature is not enabled
 */
export function FeatureGuard({
  isEnabled,
  disabledMessage = "This feature is not available",
}: FeatureGuardProps) {
  if (isEnabled) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
      <p className="text-sm text-gray-600">{disabledMessage}</p>
    </div>
  );
}

interface DisabledFeatureOverlayProps {
  /**
   * Whether to show the overlay
   */
  show: boolean;

  /**
   * Message to display
   */
  message?: string;

  /**
   * Content that's disabled
   */
  children: ReactNode;
}

/**
 * Shows content with a disabled overlay when feature is not enabled
 */
export function DisabledFeatureOverlay({
  show,
  message = "Feature currently unavailable",
  children,
}: DisabledFeatureOverlayProps) {
  if (!show) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
        <div className="rounded-lg bg-card px-4 py-2 shadow-lg border border-border">
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
