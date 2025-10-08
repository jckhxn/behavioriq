import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/supabase/auth-helpers";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/db/prisma";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";

const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { credential, name } = await request.json();

    if (!credential || !name) {
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

    if (!storedChallenge) {
      return NextResponse.json(
        { error: "Challenge not found or expired" },
        { status: 400 }
      );
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: credential as RegistrationResponseJSON,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: "Verification failed" },
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

    return NextResponse.json({ success: true, passkey });
  } catch (error) {
    console.error("Error verifying passkey registration:", error);
    return NextResponse.json(
      { error: "Failed to verify registration" },
      { status: 500 }
    );
  }
}
