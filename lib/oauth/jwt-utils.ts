import { createHmac } from "crypto";

/**
 * Utility functions for JWT operations
 * Simplified JWT implementation for OAuth 2.1 ID tokens
 */

/**
 * JWT Header
 */
interface JWTHeader {
  alg: string;
  typ: string;
}

/**
 * JWT Payload
 */
interface JWTPayload {
  [key: string]: any;
}

/**
 * Sign and create a JWT token
 * Uses HS256 (HMAC SHA-256) algorithm
 */
export function jwtSign(payload: JWTPayload, secret: string): string {
  const header: JWTHeader = {
    alg: "HS256",
    typ: "JWT",
  };

  // Encode header and payload
  const headerEncoded = base64urlEncode(JSON.stringify(header));
  const payloadEncoded = base64urlEncode(JSON.stringify(payload));

  // Create signature
  const message = `${headerEncoded}.${payloadEncoded}`;
  const signature = createHmac("sha256", secret)
    .update(message)
    .digest("base64url");

  // Combine and return
  return `${message}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export function jwtVerify(token: string, secret: string): JWTPayload | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [headerEncoded, payloadEncoded, signatureProvided] = parts;

  // Verify signature
  const message = `${headerEncoded}.${payloadEncoded}`;
  const signature = createHmac("sha256", secret)
    .update(message)
    .digest("base64url");

  if (signature !== signatureProvided) {
    return null;
  }

  // Decode payload
  try {
    const payload = JSON.parse(base64urlDecode(payloadEncoded));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Decode a JWT token without verification
 * Use with caution - only for unverified claims
 */
export function jwtDecode(token: string): JWTPayload | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(base64urlDecode(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Base64URL encode
 */
function base64urlEncode(str: string): string {
  return Buffer.from(str, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Base64URL decode
 */
function base64urlDecode(str: string): string {
  // Add padding if necessary
  const padding = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const decoded = Buffer.from(str + padding, "base64").toString("utf-8");
  return decoded;
}

/**
 * Generate PKCE code challenge from verifier
 */
export function generatePKCEChallenge(verifier: string): string {
  return createHmac("sha256", "")
    .update(verifier)
    .digest("base64url");
}

/**
 * Verify PKCE code challenge
 */
export function verifyPKCEChallenge(
  verifier: string,
  challenge: string,
  method: string = "S256"
): boolean {
  if (method === "S256") {
    return generatePKCEChallenge(verifier) === challenge;
  } else if (method === "plain") {
    return verifier === challenge;
  }

  return false;
}
