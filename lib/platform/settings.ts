import { prisma } from "@/lib/db/prisma";

// Simple in-memory cache for platform settings
// Revalidates every 60 seconds
let cachedSettings: any = null;
let cacheTime: number = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

export interface PlatformSettings {
  id: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  trialAssessmentsEnabled: boolean;
  aiReportsEnabled: boolean;
  maxAiReportsPerUser: number;
   maxConversationalSessionsPerUser: number;
  globalTrialAssessmentId: string | null;
  globalRegularAssessmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

/**
 * Get platform settings with caching
 * Returns cached settings if available and not expired
 */
export async function getPlatformSettings(
  forceRefresh = false
): Promise<PlatformSettings | null> {
  const now = Date.now();

  // Return cached settings if available and not expired
  if (!forceRefresh && cachedSettings && now - cacheTime < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const settings = await prisma.platformSettings.findFirst({
      select: {
        id: true,
        maintenanceMode: true,
        registrationEnabled: true,
        trialAssessmentsEnabled: true,
        aiReportsEnabled: true,
        maxAiReportsPerUser: true,
        maxConversationalSessionsPerUser: true,
        globalTrialAssessmentId: true,
        globalRegularAssessmentId: true,
        createdAt: true,
        updatedAt: true,
        updatedBy: true,
      },
    });

    if (settings) {
      cachedSettings = settings;
      cacheTime = now;
    }

    return settings;
  } catch (error) {
    console.error("Error fetching platform settings:", error);
    return null;
  }
}

/**
 * Check if maintenance mode is enabled
 */
export async function isMaintenanceModeEnabled(): Promise<boolean> {
  const settings = await getPlatformSettings();
  return settings?.maintenanceMode ?? false;
}

/**
 * Check if user registration is enabled
 */
export async function isRegistrationEnabled(): Promise<boolean> {
  const settings = await getPlatformSettings();
  return settings?.registrationEnabled ?? true;
}

/**
 * Check if trial assessments are enabled
 */
export async function areTrialAssessmentsEnabled(): Promise<boolean> {
  const settings = await getPlatformSettings();
  return settings?.trialAssessmentsEnabled ?? true;
}

/**
 * Check if AI reports are enabled
 */
export async function areAIReportsEnabled(): Promise<boolean> {
  const settings = await getPlatformSettings();
  return settings?.aiReportsEnabled ?? true;
}

/**
 * Get max AI reports per user
 */
export async function getMaxAIReportsPerUser(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings?.maxAiReportsPerUser ?? 10;
}

/**
 * Get max conversational sessions per user
 */
export async function getMaxConversationalSessionsPerUser(): Promise<number> {
  const settings = await getPlatformSettings();
  return settings?.maxConversationalSessionsPerUser ?? 10;
}

/**
 * Invalidate the cache (call after updating settings)
 */
export function invalidatePlatformSettingsCache(): void {
  cachedSettings = null;
  cacheTime = 0;
}
