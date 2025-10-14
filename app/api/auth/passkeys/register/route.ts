import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/db/prisma";

const rpName = process.env.NEXT_PUBLIC_SITE_NAME || "AI Diagnostic";

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
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get origin from request headers
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const rpID = getRPIDFromOrigin(origin);

    // Get user's existing passkeys
    const existingPasskeys = await prisma.passkey.findMany({
      where: { userId: user.id },
      select: { credentialId: true },
    });

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.email,
      userDisplayName: user.name || user.email,
      // Exclude credentials that the user already owns
      excludeCredentials: existingPasskeys.map((passkey) => ({
        id: Buffer.from(passkey.credentialId, "base64url"),
        type: "public-key",
        transports: ["usb", "ble", "nfc", "internal"],
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        requireResidentKey: false,
        // Omitting authenticatorAttachment allows mobile/desktop platform authenticators
        // This enables Face ID, Touch ID, Windows Hello, and Android biometrics
      },
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
    console.error("Error generating passkey registration options:", error);
    return NextResponse.json(
      { error: "Failed to generate registration options" },
      { status: 500 }
    );
  }
}
