/**
 * Utility functions for generating short, user-friendly assessment IDs
 */

/**
 * Generates a short assessment ID in the format ASS-XXXXXX
 * where XXXXXX is a random 6-character alphanumeric string
 */
export function generateShortAssessmentId(): string {
  // Originally said ASS, changed to BehaviorIQ lol
  const prefix = "BIQ";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";

  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${prefix}-${suffix}`;
}

/**
 * Validates if a string is a valid short assessment ID format
 * Supports both old ASS-XXXXXX and new BIQ-XXXXXX formats
 */
export function isValidShortAssessmentId(id: string): boolean {
  const pattern = /^(ASS|BIQ)-[A-Z0-9]{6}$/;
  return pattern.test(id);
}

/**
 * Generates a unique short assessment ID by checking against existing IDs
 * Retries up to 10 times if collision occurs
 */
export async function generateUniqueShortAssessmentId(
  checkExists: (id: string) => Promise<boolean>
): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const shortId = generateShortAssessmentId();
    const exists = await checkExists(shortId);

    if (!exists) {
      return shortId;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique short assessment ID after maximum attempts"
  );
}
