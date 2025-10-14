import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/db/prisma";
import { loginTokenService } from "@/lib/auth/login-token-service";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";

// Helper function to get RP ID from origin
function getRPIDFromOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch {
    return "localhost";
  }
}

export async function POST(request: Request) {
  // Get origin from request headers
  const origin = request.headers.get("origin") || "http://localhost:3000";
  const rpID = getRPIDFromOrigin(origin);
  try {
    const { credential, email } = await request.json();

    if (!credential || !email) {
      return NextResponse.json(
        { error: "Missing credential or email" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        passkeys: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the stored challenge
    const storedChallenge = await prisma.passkeyChallenge.findFirst({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!storedChallenge) {
      return NextResponse.json(
        { error: "Challenge not found or expired" },
        { status: 400 }
      );
    }

    // Find the passkey used for this authentication
    const credentialIdBuffer = Buffer.from(
      (credential as AuthenticationResponseJSON).id,
      "base64url"
    );
    const credentialIdBase64url = credentialIdBuffer.toString("base64url");

    const passkey = user.passkeys.find(
      (p) => p.credentialId === credentialIdBase64url
    );

    if (!passkey) {
      return NextResponse.json(
        { error: "Passkey not found" },
        { status: 404 }
      );
    }

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: credential as AuthenticationResponseJSON,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(passkey.credentialId, "base64url"),
        credentialPublicKey: Buffer.from(passkey.publicKey, "base64url"),
        counter: Number(passkey.counter),
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 400 }
      );
    }

    // Update passkey counter and last used time
    await prisma.passkey.update({
      where: { id: passkey.id },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        lastUsed: new Date(),
      },
    });

    // Delete the used challenge
    await prisma.passkeyChallenge.delete({
      where: { id: storedChallenge.id },
    });

    // Update user's last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate one-time login token
    const loginToken = await loginTokenService.generateToken(user.id);

    return NextResponse.json({
      success: true,
      loginToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error verifying passkey authentication:", error);
    return NextResponse.json(
      { error: "Failed to verify authentication" },
      { status: 500 }
    );
  }
}
