import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/db/prisma";

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
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        passkeys: {
          select: {
            credentialId: true,
            transports: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.passkeys.length === 0) {
      return NextResponse.json(
        { error: "No passkeys registered for this account" },
        { status: 400 }
      );
    }

    // Generate authentication options
    // Use empty allowCredentials to support discoverable credentials (synced passkeys)
    // This enables cross-device authentication with Google Password Manager, iCloud Keychain, etc.
    const options = await generateAuthenticationOptions({
      rpID,
      // Empty allowCredentials allows the authenticator to present all available passkeys
      // This supports synced passkeys from Google Password Manager, iCloud Keychain, etc.
      allowCredentials: [],
      userVerification: "preferred",
    });

    // Store challenge for verification
    await prisma.passkeyChallenge.create({
      data: {
        userId: user.id,
        challenge: options.challenge,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // Clean up expired challenges
    await prisma.passkeyChallenge.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Error generating passkey authentication options:", error);
    return NextResponse.json(
      { error: "Failed to generate authentication options" },
      { status: 500 }
    );
  }
}
