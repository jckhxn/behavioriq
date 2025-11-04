import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/oauth/userinfo
 * OAuth 2.1 userinfo endpoint
 * Returns authenticated user information
 */
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "invalid_token" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    // Look up access token
    const oauthToken = await prisma.oauthToken.findUnique({
      where: { accessToken },
    });

    if (!oauthToken) {
      return NextResponse.json(
        { error: "invalid_token" },
        { status: 401 }
      );
    }

    // Check if token has expired
    if (oauthToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "expired_token" },
        { status: 401 }
      );
    }

    // For ChatGPT integration, we return minimal user info
    // since we don't have a direct user association with OAuth tokens
    const userInfo = {
      sub: oauthToken.clientId, // Subject (client ID)
      aud: oauthToken.clientId, // Audience
      iss: process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com",
      iat: Math.floor(oauthToken.createdAt.getTime() / 1000),
      // Additional claims for ChatGPT
      scope: "openid profile email",
    };

    return NextResponse.json(userInfo);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[OAuth Userinfo API] Error:", errorMessage);

    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    );
  }
}
