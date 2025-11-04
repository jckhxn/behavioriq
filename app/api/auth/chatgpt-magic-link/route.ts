import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resend } from "@/lib/email/resend";
import { randomBytes } from "crypto";

/**
 * POST /api/auth/chatgpt-magic-link
 * Request a magic link for passwordless authentication from ChatGPT widget
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: normalizedEmail.split("@")[0],
          emailVerified: false,
          credits: 0,
        },
      });
    }

    // Generate magic link token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store magic link token
    await prisma.magicLinkToken.upsert({
      where: { email: normalizedEmail },
      update: {
        token,
        expiresAt,
      },
      create: {
        email: normalizedEmail,
        token,
        expiresAt,
        userId: user.id,
      },
    });

    // Generate magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://app.behavioriq.com";
    const magicLink = `${baseUrl}/api/auth/chatgpt-magic-link/verify?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send email with magic link
    try {
      await resend.emails.send({
        from: "noreply@behavioriq.com",
        to: normalizedEmail,
        subject: "Your BehaviorIQ Login Link",
        html: generateMagicLinkEmail(normalizedEmail, magicLink),
      });
    } catch (emailError) {
      console.error("Failed to send magic link email:", emailError);
      // Don't fail the request, log the error and continue
    }

    return NextResponse.json({
      success: true,
      message: `Magic link sent to ${normalizedEmail}`,
      email: normalizedEmail,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[ChatGPT Magic Link API] Error:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to process magic link request. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/chatgpt-magic-link/verify
 * Verify magic link token and return auth token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { error: "Invalid magic link" },
        { status: 400 }
      );
    }

    // Verify magic link token
    const magicLinkToken = await prisma.magicLinkToken.findUnique({
      where: { email },
      include: { user: true },
    });

    if (!magicLinkToken) {
      return NextResponse.json(
        { error: "Magic link not found" },
        { status: 404 }
      );
    }

    // Check if token is valid
    if (magicLinkToken.token !== token) {
      return NextResponse.json(
        { error: "Invalid magic link token" },
        { status: 401 }
      );
    }

    // Check if token has expired
    if (magicLinkToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Magic link has expired" },
        { status: 401 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: magicLinkToken.user.id },
      data: {
        emailVerified: true,
      },
    });

    // Delete used token
    await prisma.magicLinkToken.delete({
      where: { email },
    });

    // Return user data and auth token
    const response = NextResponse.json({
      success: true,
      user: {
        id: magicLinkToken.user.id,
        email: magicLinkToken.user.email,
        name: magicLinkToken.user.name,
        credits: magicLinkToken.user.credits,
      },
      token: generateSessionToken(magicLinkToken.user.id),
    });

    // Set authentication cookie
    response.cookies.set({
      name: "auth_token",
      value: generateSessionToken(magicLinkToken.user.id),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[ChatGPT Magic Link Verify API] Error:", errorMessage);

    return NextResponse.json(
      { error: "Failed to verify magic link" },
      { status: 500 }
    );
  }
}

/**
 * Generate magic link email HTML
 */
function generateMagicLinkEmail(email: string, magicLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Your BehaviorIQ Login Link</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f9fafb;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 8px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }
        .content {
          padding: 40px 30px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 14px 40px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
        }
        .button:hover {
          opacity: 0.9;
        }
        .link-container {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
          word-break: break-all;
          font-size: 12px;
          color: #666;
          font-family: monospace;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #999;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 13px;
        }
        .divider {
          height: 1px;
          background: #eee;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-content">
          <div class="header">
            <h1>🔐 Your Login Link</h1>
            <p>One-click access to BehaviorIQ</p>
          </div>

          <div class="content">
            <p>Hi,</p>

            <p>
              Click the button below to sign in to your BehaviorIQ account and continue your assessment. This link will expire in 24 hours.
            </p>

            <a href="${magicLink}" class="button">Sign In Now</a>

            <p style="text-align: center; color: #999; font-size: 13px;">Or paste this link in your browser:</p>

            <div class="link-container">
              ${magicLink}
            </div>

            <div class="warning">
              <strong>🔒 Security:</strong> If you didn't request this link, you can ignore this email. This link is unique and can only be used once.
            </div>

            <div class="divider"></div>

            <p style="font-size: 13px; color: #666;">
              <strong>Why we use magic links:</strong> Magic links are more secure than passwords. No password to remember or reset.
            </p>

            <p style="font-size: 13px; color: #666;">
              <strong>About your data:</strong> Your assessment responses are encrypted and securely stored. We never share your data with third parties.
            </p>

            <div class="footer">
              <p>© ${new Date().getFullYear()} BehaviorIQ. All rights reserved.</p>
              <p>
                <a href="https://behavioriq.com/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> •
                <a href="https://behavioriq.com/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a> •
                <a href="mailto:support@behavioriq.com" style="color: #667eea; text-decoration: none;">Support</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate a session token
 * In production, use JWT or your existing session system
 */
function generateSessionToken(userId: string): string {
  // This is a simplified example
  const timestamp = Date.now();
  const data = `${userId}:${timestamp}`;
  return Buffer.from(data).toString("base64");
}
