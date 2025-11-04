import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { v4 as uuidv4 } from "uuid";

/**
 * Request context with authentication and rate limiting info
 */
export interface ChatGPTRequestContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  isRateLimited: boolean;
  rateLimitRemaining: number;
}

/**
 * In-memory rate limiter (simple, no Redis needed)
 */
const rateLimitStore = new Map<
  string,
  { timestamps: number[]; lastCleanup: number }
>();

const RATE_LIMITS = {
  session: { requests: 10, windowMs: 60 * 1000 }, // 10 req/min per session
  user: { requests: 30, windowMs: 60 * 1000 }, // 30 req/min per user
  ip: { requests: 100, windowMs: 60 * 1000 }, // 100 req/min per IP
};

/**
 * Check rate limit for a key
 */
function checkRateLimit(
  key: string,
  limit: { requests: number; windowMs: number }
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = { timestamps: [], lastCleanup: now };
    rateLimitStore.set(key, entry);
  }

  // Cleanup old timestamps every minute
  if (now - entry.lastCleanup > 60 * 1000) {
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < limit.windowMs);
    entry.lastCleanup = now;
  }

  // Remove old timestamps
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < limit.windowMs);

  // Check if limit exceeded
  const allowed = entry.timestamps.length < limit.requests;
  const remaining = Math.max(0, limit.requests - entry.timestamps.length - 1);

  if (allowed) {
    entry.timestamps.push(now);
  }

  return { allowed, remaining };
}

/**
 * Validate X-API-Key header and return user
 */
export async function validateApiKey(
  request: NextRequest
): Promise<{ userId: string | null; error?: string }> {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return { userId: null, error: "Missing X-API-Key header" };
  }

  try {
    // Look up API key in MagicLinkToken table (using token field)
    // API keys are stored with email as user identifier
    const token = await prisma.magicLinkToken.findUnique({
      where: { token: apiKey },
      include: { user: true },
    });

    if (!token || !token.user) {
      return { userId: null, error: "Invalid API key" };
    }

    // Check if token has expired (very far in future for API keys)
    if (new Date() > token.expiresAt) {
      return { userId: null, error: "API key expired" };
    }

    return { userId: token.user.id };
  } catch (error) {
    console.error("API key validation error:", error);
    return { userId: null, error: "Failed to validate API key" };
  }
}

/**
 * Apply rate limiting to a request
 */
export function applyRateLimit(
  identifier: string,
  limit: (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS]
): { allowed: boolean; remaining: number } {
  return checkRateLimit(identifier, limit);
}

/**
 * Create error response with request ID
 */
export function createErrorResponse(
  error: string,
  code: string,
  requestId: string,
  status: number
) {
  return NextResponse.json(
    {
      error,
      code,
      requestId,
    },
    { status }
  );
}

/**
 * Middleware for public endpoints (no auth required)
 * Applies basic rate limiting and request ID generation
 */
export async function publicEndpointMiddleware(
  request: NextRequest,
  identifier: string // sessionId or IP
): Promise<{
  context: ChatGPTRequestContext;
  error?: NextResponse;
}> {
  const requestId = uuidv4();

  // Apply rate limiting
  const rateLimit = applyRateLimit(identifier, RATE_LIMITS.session);

  if (!rateLimit.allowed) {
    return {
      context: {
        requestId,
        isRateLimited: true,
        rateLimitRemaining: 0,
        sessionId: identifier,
      },
      error: createErrorResponse(
        "Rate limit exceeded",
        "RATE_LIMIT_EXCEEDED",
        requestId,
        429
      ),
    };
  }

  return {
    context: {
      requestId,
      sessionId: identifier,
      isRateLimited: false,
      rateLimitRemaining: rateLimit.remaining,
    },
  };
}

/**
 * Middleware for authenticated endpoints (require X-API-Key)
 * Returns user context or error response
 */
export async function authenticatedEndpointMiddleware(
  request: NextRequest
): Promise<{
  context: ChatGPTRequestContext;
  error?: NextResponse;
}> {
  const requestId = uuidv4();

  // Validate API key
  const apiKeyValidation = await validateApiKey(request);

  if (!apiKeyValidation.userId) {
    return {
      context: {
        requestId,
        isRateLimited: false,
        rateLimitRemaining: 0,
      },
      error: createErrorResponse(
        apiKeyValidation.error || "Unauthorized",
        "INVALID_API_KEY",
        requestId,
        401
      ),
    };
  }

  // Apply rate limiting per user
  const rateLimit = applyRateLimit(apiKeyValidation.userId, RATE_LIMITS.user);

  if (!rateLimit.allowed) {
    return {
      context: {
        requestId,
        userId: apiKeyValidation.userId,
        isRateLimited: true,
        rateLimitRemaining: 0,
      },
      error: createErrorResponse(
        "Rate limit exceeded",
        "RATE_LIMIT_EXCEEDED",
        requestId,
        429
      ),
    };
  }

  return {
    context: {
      requestId,
      userId: apiKeyValidation.userId,
      isRateLimited: false,
      rateLimitRemaining: rateLimit.remaining,
    },
  };
}

/**
 * Extract user's IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}
