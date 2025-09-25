/**
 * Utilities for generating and managing shareable assessment links
 */

/**
 * Generates a short, random share code for shareable links
 */
export function generateShareCode(): string {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Validates if a share code has the correct format
 */
export function isValidShareCode(code: string): boolean {
  const pattern = /^[A-Z0-9]{8}$/;
  return pattern.test(code);
}

/**
 * Generates a unique share code by checking against existing codes
 */
export async function generateUniqueShareCode(
  checkExists: (code: string) => Promise<boolean>
): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const shareCode = generateShareCode();
    const exists = await checkExists(shareCode);

    if (!exists) {
      return shareCode;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique share code after maximum attempts"
  );
}

/**
 * Generates a shareable URL for an assessment
 */
export function generateShareableUrl(
  shareCode: string,
  baseUrl?: string
): string {
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/share/${shareCode}`;
}
