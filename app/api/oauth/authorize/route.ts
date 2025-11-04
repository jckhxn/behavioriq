import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";
import { createHash } from "crypto";

/**
 * GET /api/oauth/authorize
 * OAuth 2.1 authorization endpoint with PKCE support
 * Called by ChatGPT to initiate authentication flow
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract OAuth parameters
    const clientId = searchParams.get("client_id");
    const responseType = searchParams.get("response_type") || "code";
    const redirectUri = searchParams.get("redirect_uri");
    const scope = searchParams.get("scope") || "openid profile email";
    const state = searchParams.get("state");
    const nonce = searchParams.get("nonce");

    // PKCE parameters
    const codeChallenge = searchParams.get("code_challenge");
    const codeChallengeMethod = searchParams.get("code_challenge_method") || "S256";

    // Validate required parameters
    if (!clientId || !redirectUri || !state) {
      return NextResponse.json(
        { error: "missing_required_parameters" },
        { status: 400 }
      );
    }

    // Validate response type
    if (!["code", "code id_token", "code id_token token", "token", "id_token"].includes(responseType)) {
      return NextResponse.json(
        { error: "unsupported_response_type" },
        { status: 400 }
      );
    }

    // Validate redirect URI format
    try {
      new URL(redirectUri);
    } catch {
      return NextResponse.json(
        { error: "invalid_redirect_uri" },
        { status: 400 }
      );
    }

    // Generate authorization code
    const code = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store authorization code
    await prisma.authorizationCode.create({
      data: {
        code,
        clientId,
        redirectUri,
        scope,
        expiresAt,
        codeChallenge,
        codeChallengeMethod,
        state,
        nonce,
      },
    });

    // Redirect back to ChatGPT with authorization code
    const responseUrl = new URL(redirectUri);
    responseUrl.searchParams.set("code", code);
    responseUrl.searchParams.set("state", state);

    return NextResponse.redirect(responseUrl);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[OAuth Authorize API] Error:", errorMessage);

    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/oauth/authorize
 * Handle form-based authorization (for compatibility)
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Convert POST to GET by reconstructing query string
  const searchParams = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });

  const url = new URL(request.url);
  url.search = searchParams.toString();

  return GET(new NextRequest(url));
}
