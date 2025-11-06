import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createHash } from "crypto";
import { randomBytes } from "crypto";
import { jwtSign } from "@/lib/oauth/jwt-utils";

/**
 * POST /api/oauth/token
 * OAuth 2.1 token endpoint
 * Exchanges authorization code for access token (and ID token if requested)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      grant_type,
      code,
      client_id,
      client_secret,
      redirect_uri,
      code_verifier,
      refresh_token,
    } = body;

    // Handle authorization code grant
    if (grant_type === "authorization_code") {
      return handleAuthorizationCodeGrant(
        code,
        client_id,
        client_secret,
        redirect_uri,
        code_verifier
      );
    }

    // Handle refresh token grant
    if (grant_type === "refresh_token") {
      return handleRefreshTokenGrant(refresh_token, client_id, client_secret);
    }

    // Handle client credentials grant
    if (grant_type === "client_credentials") {
      return handleClientCredentialsGrant(client_id, client_secret);
    }

    return NextResponse.json(
      { error: "unsupported_grant_type" },
      { status: 400 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[OAuth Token API] Error:", errorMessage);

    return NextResponse.json(
      { error: "server_error", error_description: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Handle authorization code grant with PKCE
 */
async function handleAuthorizationCodeGrant(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  codeVerifier: string
) {
  if (!code || !clientId || !redirectUri) {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400 }
    );
  }

  // Retrieve authorization code
  const authCode = await prisma.authorizationCode.findUnique({
    where: { code },
  });

  if (!authCode) {
    return NextResponse.json(
      { error: "invalid_grant" },
      { status: 400 }
    );
  }

  // Verify code hasn't expired
  if (authCode.expiresAt < new Date()) {
    await prisma.authorizationCode.delete({ where: { code } });
    return NextResponse.json(
      { error: "expired_code" },
      { status: 400 }
    );
  }

  // Verify client ID and redirect URI
  if (authCode.clientId !== clientId || authCode.redirectUri !== redirectUri) {
    return NextResponse.json(
      { error: "invalid_grant" },
      { status: 400 }
    );
  }

  // Verify PKCE code challenge
  if (authCode.codeChallenge) {
    if (!codeVerifier) {
      return NextResponse.json(
        { error: "invalid_request" },
        { status: 400 }
      );
    }

    const verifierHash = createHash("sha256").update(codeVerifier).digest("base64url");
    if (verifierHash !== authCode.codeChallenge) {
      return NextResponse.json(
        { error: "invalid_grant" },
        { status: 400 }
      );
    }
  }

  // Generate tokens
  const accessToken = randomBytes(32).toString("hex");
  const refreshToken = randomBytes(32).toString("hex");
  const expiresIn = 3600; // 1 hour

  // Store tokens
  const oAuthToken = await prisma.oAuthToken.create({
    data: {
      clientId,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    },
  });

  // Generate ID token if scope includes openid
  let idToken = null;
  if (authCode.scope?.includes("openid")) {
    idToken = jwtSign(
      {
        iss: process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com",
        sub: clientId,
        aud: clientId,
        nonce: authCode.nonce,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn,
      },
      process.env.JWT_SIGNING_KEY || "your-secret-key"
    );
  }

  // Delete used authorization code
  await prisma.authorizationCode.delete({ where: { code } });

  const response = {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: expiresIn,
    refresh_token: refreshToken,
    ...(idToken && { id_token: idToken }),
  };

  return NextResponse.json(response);
}

/**
 * Handle refresh token grant
 */
async function handleRefreshTokenGrant(
  refreshToken: string,
  clientId: string,
  clientSecret: string
) {
  if (!refreshToken || !clientId) {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400 }
    );
  }

  // Retrieve refresh token
  const oAuthToken = await prisma.oAuthToken.findUnique({
    where: { refreshToken },
  });

  if (!oAuthToken || oAuthToken.clientId !== clientId) {
    return NextResponse.json(
      { error: "invalid_grant" },
      { status: 400 }
    );
  }

  // Generate new access token
  const newAccessToken = randomBytes(32).toString("hex");
  const expiresIn = 3600; // 1 hour

  // Update token
  await prisma.oAuthToken.update({
    where: { refreshToken },
    data: {
      accessToken: newAccessToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    },
  });

  return NextResponse.json({
    access_token: newAccessToken,
    token_type: "Bearer",
    expires_in: expiresIn,
  });
}

/**
 * Handle client credentials grant
 */
async function handleClientCredentialsGrant(
  clientId: string,
  clientSecret: string
) {
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400 }
    );
  }

  // In production, verify client credentials against database
  // For now, return a valid token for testing
  const accessToken = randomBytes(32).toString("hex");
  const expiresIn = 3600; // 1 hour

  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: expiresIn,
  });
}
