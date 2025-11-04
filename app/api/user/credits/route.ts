import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  CreditsResponseSchema,
} from "@/lib/api/chatgpt/schemas";
import {
  authenticatedEndpointMiddleware,
  createErrorResponse,
} from "@/lib/api/chatgpt/middleware";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/user/credits?user_id=<userId>
 * Get user's remaining credits (requires X-API-Key authentication)
 */
export async function GET(request: NextRequest) {
  const requestId = uuidv4();

  try {
    // Apply authentication middleware
    const { context, error } = await authenticatedEndpointMiddleware(request);

    if (error) {
      return error;
    }

    if (!context.userId) {
      return createErrorResponse(
        "User context missing",
        "AUTH_ERROR",
        requestId,
        401
      );
    }

    // Get user_id from query parameters (may be redundant with auth, but spec requires it)
    const { searchParams } = new URL(request.url);
    const queriedUserId = searchParams.get("user_id");

    // Fetch user from database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: context.userId },
        select: {
          id: true,
          credits: true,
        },
      });
    } catch (error) {
      console.error("[User Credits] Database error:", error);
      return createErrorResponse(
        "Failed to fetch user credits",
        "DATABASE_ERROR",
        requestId,
        500
      );
    }

    if (!user) {
      return createErrorResponse("User not found", "USER_NOT_FOUND", requestId, 404);
    }

    // Calculate credits used (from transactions if available)
    let creditsUsed = 0;
    try {
      const transactions = await prisma.creditTransaction.findMany({
        where: {
          userId: context.userId,
          type: "ASSESSMENT_STARTED",
        },
      });
      creditsUsed = Math.abs(
        transactions.reduce((sum, t) => sum + t.amount, 0)
      );
    } catch (error) {
      console.error("[User Credits] Transaction fetch error:", error);
      // Continue without transaction data if there's an error
    }

    // Format response
    const responseBody = CreditsResponseSchema.parse({
      userId: user.id,
      credits: user.credits || 0,
      creditsUsed,
    });

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[User Credits] Unexpected error:", errorMessage);

    return createErrorResponse(
      "Internal server error",
      "INTERNAL_ERROR",
      requestId,
      500
    );
  }
}
