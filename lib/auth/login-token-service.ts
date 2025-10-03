import { prisma } from "@/lib/db/prisma";

export class LoginTokenService {
  /**
   * Generate a secure one-time login token for a user
   * Token expires in 15 minutes
   */
  async generateToken(userId: string): Promise<string> {
    // Generate a cryptographically secure random token using Web Crypto API (Edge Runtime compatible)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Token expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.loginToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Validate and consume a login token
   * Returns the user ID if valid, null otherwise
   */
  async validateAndConsumeToken(token: string): Promise<string | null> {
    const loginToken = await prisma.loginToken.findUnique({
      where: { token },
    });

    if (!loginToken) {
      return null;
    }

    // Check if already used
    if (loginToken.usedAt) {
      return null;
    }

    // Check if expired
    if (loginToken.expiresAt < new Date()) {
      return null;
    }

    // Mark token as used
    await prisma.loginToken.update({
      where: { id: loginToken.id },
      data: { usedAt: new Date() },
    });

    return loginToken.userId;
  }

  /**
   * Clean up expired tokens (can be run as a cron job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.loginToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null } },
        ],
      },
    });

    return result.count;
  }
}

export const loginTokenService = new LoginTokenService();
