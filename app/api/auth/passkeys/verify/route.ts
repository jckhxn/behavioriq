import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/db/prisma";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";

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
    console.log("[Passkey Verify] User:", user?.id, user?.email);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get origin from request headers
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const rpID = getRPIDFromOrigin(origin);

    const { credential, name } = await request.json();
    console.log("[Passkey Verify] Credential ID:", credential?.id);
    console.log("[Passkey Verify] Name:", name);

    if (!credential || !name) {
      console.error("[Passkey Verify] Missing credential or name");
      return NextResponse.json(
        { error: "Missing credential or name" },
        { status: 400 }
      );
    }

    // Get the stored challenge
    const storedChallenge = await prisma.passkeyChallenge.findFirst({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("[Passkey Verify] Challenge found:", !!storedChallenge);

    if (!storedChallenge) {
      console.error("[Passkey Verify] Challenge not found or expired");
      return NextResponse.json(
        { error: "Challenge not found or expired" },
        { status: 400 }
      );
    }

    console.log("[Passkey Verify] Verifying with:", {
      expectedOrigin: origin,
      expectedRPID: rpID,
      challengeLength: storedChallenge.challenge.length,
    });

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: credential as RegistrationResponseJSON,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    console.log("[Passkey Verify] Verification result:", {
      verified: verification.verified,
      hasRegistrationInfo: !!verification.registrationInfo,
    });

    if (!verification.verified || !verification.registrationInfo) {
      console.error("[Passkey Verify] Verification failed:", verification);
      return NextResponse.json(
        { error: "Verification failed - check server logs for details" },
        { status: 400 }
      );
    }

    const { credentialPublicKey, credentialID, counter } =
      verification.registrationInfo;

    // Store the passkey
    const passkey = await prisma.passkey.create({
      data: {
        userId: user.id,
        name,
        credentialId: Buffer.from(credentialID).toString("base64url"),
        publicKey: Buffer.from(credentialPublicKey).toString("base64url"),
        counter: BigInt(counter),
        transports: credential.response?.transports || [],
      },
    });

    // Delete the used challenge
    await prisma.passkeyChallenge.delete({
      where: { id: storedChallenge.id },
    });

    console.log("[Passkey Verify] ✅ Passkey registered successfully:", passkey.id);

    // Return passkey without BigInt fields (convert counter to string)
    return NextResponse.json({
      success: true,
      passkey: {
        id: passkey.id,
        name: passkey.name,
        credentialId: passkey.credentialId,
        counter: passkey.counter.toString(), // Convert BigInt to string
        createdAt: passkey.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[Passkey Verify] Error verifying passkey registration:", error);
    console.error("[Passkey Verify] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to verify registration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
