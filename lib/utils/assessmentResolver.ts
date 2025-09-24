import { prisma } from "@/lib/db/prisma";
import { isValidShortAssessmentId } from "@/lib/utils/shortId";

/**
 * Resolves an assessment identifier (shortId or UUID) to the internal database ID
 * @param assessmentIdentifier - Either a shortId (BIQ-XXXXXX) or UUID
 * @param userId - User ID to ensure ownership
 * @returns The internal UUID of the assessment, or null if not found
 */
export async function resolveAssessmentId(
  assessmentIdentifier: string,
  userId: string
): Promise<string | null> {
  try {
    // If it looks like a shortId, look it up
    if (isValidShortAssessmentId(assessmentIdentifier)) {
      const assessment = await prisma.assessment.findFirst({
        where: {
          shortId: assessmentIdentifier,
          userId,
        },
        select: {
          id: true,
        },
      });
      return assessment?.id || null;
    }

    // Otherwise, treat it as a UUID and verify ownership
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentIdentifier,
        userId,
      },
      select: {
        id: true,
      },
    });
    return assessment?.id || null;
  } catch (error) {
    console.error("Error resolving assessment ID:", error);
    return null;
  }
}

/**
 * Gets assessment data by shortId or UUID
 * @param assessmentIdentifier - Either a shortId (BIQ-XXXXXX) or UUID
 * @param userId - User ID to ensure ownership
 * @returns The assessment data or null if not found
 */
export async function getAssessmentByIdentifier(
  assessmentIdentifier: string,
  userId: string
) {
  try {
    const where = isValidShortAssessmentId(assessmentIdentifier)
      ? { shortId: assessmentIdentifier, userId }
      : { id: assessmentIdentifier, userId };

    return await prisma.assessment.findFirst({ where });
  } catch (error) {
    console.error("Error getting assessment by identifier:", error);
    return null;
  }
}
