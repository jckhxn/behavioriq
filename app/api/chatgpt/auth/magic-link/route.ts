import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email/send-email";
import crypto from "crypto";

/**
 * POST /api/chatgpt/auth/magic-link
 *
 * Send magic link for authentication in ChatGPT widget
 * Creates or finds user, generates token, sends email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, returnTo, sessionId, assessmentId } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    console.log("[ChatGPT Auth] Generating magic link for:", email);

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // If user doesn't exist, create them
    if (!user) {
      // Generate random password (won't be used, magic link only)
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: email.split("@")[0], // Use email prefix as default name
          role: "USER",
        },
      });

      console.log("[ChatGPT Auth] Created new user:", user.id);
    }

    // Generate login token (15 minute expiration)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.loginToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
        usedAt: null,
      },
    });

    // Construct magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const callbackUrl = new URL(`${baseUrl}/chatgpt/auth/callback`);
    callbackUrl.searchParams.set("token", token);
    if (sessionId) callbackUrl.searchParams.set("sessionId", sessionId);
    if (assessmentId) callbackUrl.searchParams.set("assessmentId", assessmentId);
    if (returnTo) callbackUrl.searchParams.set("returnTo", returnTo);

    // Send magic link email
    try {
      await sendEmail({
        to: email,
        subject: "Sign in to BehaviorIQ - ChatGPT",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Sign in to BehaviorIQ</h2>
            <p>Click the link below to continue your assessment in ChatGPT:</p>
            <div style="margin: 30px 0;">
              <a href="${callbackUrl.toString()}"
                 style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Continue Assessment
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Sent from BehaviorIQ ChatGPT integration
            </p>
          </div>
        `,
        text: `
Sign in to BehaviorIQ

Click this link to continue your assessment in ChatGPT:
${callbackUrl.toString()}

This link expires in 15 minutes.
        `,
      });

      console.log("[ChatGPT Auth] Magic link email sent to:", email);
    } catch (emailError) {
      console.error("[ChatGPT Auth] Failed to send email:", emailError);
      // Don't fail the request if email fails - user can retry
    }

    return NextResponse.json({
      success: true,
      message: "Magic link sent! Check your email.",
      email,
      expiresIn: 900, // 15 minutes in seconds
    });
  } catch (error) {
    console.error("[ChatGPT Auth] Error generating magic link:", error);
    return NextResponse.json(
      {
        error: "Failed to send magic link",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
