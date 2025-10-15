import { ConversationalSession } from "./types";
import { prisma } from "@/lib/db/prisma";

/**
 * Database-backed session storage for conversational assessments
 *
 * Features:
 * - Persistent storage (survives server restarts)
 * - Idempotency (prevents duplicate question submissions)
 * - Rate limiting (prevents rapid-fire abuse)
 * - Audit trail (tracks all submissions)
 * - Session resumption (can resume from last answered question)
 */
class DatabaseSessionStore {
  /**
   * Save or update a conversational session
   */
  async set(sessionId: string, session: ConversationalSession): Promise<void> {
    try {
      await prisma.conversationalSession.upsert({
        where: { id: sessionId },
        create: {
          id: sessionId,
          assessmentId: session.assessmentId,
          userId: session.userId || null,
          currentQuestionIndex: session.currentQuestionIndex,
          responses: session.responses,
          messages: session.messages as any,
          isComplete: session.isComplete,
          isTrial: session.isTrial,
          questions: session.questions as any,
          totalTokenUsage: session.totalTokenUsage as any,
          clarificationAttempts: session.clarificationAttempts || 0,
          lastSubmittedAt: new Date(),
          submissionCount: 0,
        },
        update: {
          currentQuestionIndex: session.currentQuestionIndex,
          responses: session.responses,
          messages: session.messages as any,
          questions: session.questions as any,
          totalTokenUsage: session.totalTokenUsage as any,
          isComplete: session.isComplete,
          clarificationAttempts: session.clarificationAttempts || 0,
          lastSubmittedAt: new Date(),
          submissionCount: {
            increment: 1,
          },
        },
      });

      console.log(
        `[DatabaseSessionStore] Session ${sessionId} saved to database`
      );
    } catch (error) {
      console.error(
        `[DatabaseSessionStore] Error saving session ${sessionId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Retrieve a conversational session
   */
  async get(sessionId: string): Promise<ConversationalSession | undefined> {
    try {
      const session = await prisma.conversationalSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        console.log(`[DatabaseSessionStore] Session ${sessionId} not found`);
        return undefined;
      }

      console.log(
        `[DatabaseSessionStore] Session ${sessionId} retrieved from database`
      );

      // Convert database model to ConversationalSession type
      return {
        id: session.id,
        assessmentId: session.assessmentId,
        userId: session.userId || undefined,
        currentQuestionIndex: session.currentQuestionIndex,
        responses: session.responses as any,
        questions: session.questions as any,
        messages: session.messages as any,
        isComplete: session.isComplete,
        isTrial: session.isTrial,
        totalTokenUsage: session.totalTokenUsage as any,
        clarificationAttempts: session.clarificationAttempts,
      };
    } catch (error) {
      console.error(
        `[DatabaseSessionStore] Error retrieving session ${sessionId}:`,
        error
      );
      return undefined;
    }
  }

  /**
   * Get session by assessment ID (for resumption)
   */
  async getByAssessmentId(
    assessmentId: string
  ): Promise<ConversationalSession | undefined> {
    try {
      const session = await prisma.conversationalSession.findUnique({
        where: { assessmentId },
      });

      if (!session) {
        return undefined;
      }

      return {
        id: session.id,
        assessmentId: session.assessmentId,
        userId: session.userId || undefined,
        currentQuestionIndex: session.currentQuestionIndex,
        responses: session.responses as Record<string, boolean>,
        messages: session.messages as any[],
        isComplete: session.isComplete,
        isTrial: session.isTrial,
        questions: session.questions as any[],
        totalTokenUsage: session.totalTokenUsage as any,
        clarificationAttempts: session.clarificationAttempts,
      };
    } catch (error) {
      console.error(
        `[DatabaseSessionStore] Error retrieving session by assessment ${assessmentId}:`,
        error
      );
      return undefined;
    }
  }

  /**
   * Delete a session
   */
  async delete(sessionId: string): Promise<boolean> {
    try {
      await prisma.conversationalSession.delete({
        where: { id: sessionId },
      });

      console.log(
        `[DatabaseSessionStore] Session ${sessionId} deleted from database`
      );
      return true;
    } catch (error) {
      console.error(
        `[DatabaseSessionStore] Error deleting session ${sessionId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Check if session exists
   */
  async has(sessionId: string): Promise<boolean> {
    try {
      const count = await prisma.conversationalSession.count({
        where: { id: sessionId },
      });
      return count > 0;
    } catch (error) {
      console.error(
        `[DatabaseSessionStore] Error checking session ${sessionId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get total number of active sessions
   */
  async size(): Promise<number> {
    try {
      return await prisma.conversationalSession.count();
    } catch (error) {
      console.error(
        `[DatabaseSessionStore] Error getting session count:`,
        error
      );
      return 0;
    }
  }

  /**
   * Record a question submission for idempotency and audit trail
   * Returns true if this is a new submission, false if it's a duplicate
   */
  async recordSubmission(
    sessionId: string,
    questionId: string,
    questionIndex: number,
    userResponse: string,
    extractedAnswer: boolean | null,
    confidence: number,
    wasRecorded: boolean,
    tokenUsage?: any
  ): Promise<boolean> {
    try {
      await prisma.conversationalSubmission.create({
        data: {
          sessionId,
          questionId,
          questionIndex,
          userResponse,
          extractedAnswer,
          confidence,
          wasRecorded,
          tokenUsage: tokenUsage || null,
        },
      });

      console.log(
        `[DatabaseSessionStore] Submission recorded for question ${questionId}`
      );
      return true;
    } catch (error: any) {
      // Check if this is a unique constraint violation (duplicate submission)
      if (error?.code === "P2002") {
        console.log(
          `[DatabaseSessionStore] Duplicate submission detected for question ${questionId}`
        );
        return false;
      }
      // Other errors
      throw error;
    }
  }

  /**
   * Check rate limiting - returns true if user is submitting too fast
   */
  async isRateLimited(
    sessionId: string,
    minSecondsBetweenSubmissions: number = 2
  ): Promise<boolean> {
    try {
      const session = await prisma.conversationalSession.findUnique({
        where: { id: sessionId },
        select: { lastSubmittedAt: true },
      });

      if (!session?.lastSubmittedAt) {
        return false; // First submission
      }

      const secondsSinceLastSubmission =
        (Date.now() - session.lastSubmittedAt.getTime()) / 1000;

      return secondsSinceLastSubmission < minSecondsBetweenSubmissions;
    } catch (error) {
      console.error(`[DatabaseSessionStore] Error checking rate limit:`, error);
      return false; // Allow submission on error
    }
  }

  /**
   * Get submission count for monitoring abuse
   */
  async getSubmissionCount(sessionId: string): Promise<number> {
    try {
      const session = await prisma.conversationalSession.findUnique({
        where: { id: sessionId },
        select: { submissionCount: true },
      });

      return session?.submissionCount || 0;
    } catch (error) {
      console.error(
        `[DatabaseSessionStore] Error getting submission count:`,
        error
      );
      return 0;
    }
  }

  /**
   * Clean up old incomplete sessions (older than 24 hours)
   */
  async cleanupOldSessions(): Promise<number> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const result = await prisma.conversationalSession.deleteMany({
        where: {
          isComplete: false,
          updatedAt: {
            lt: oneDayAgo,
          },
        },
      });

      console.log(
        `[DatabaseSessionStore] Cleaned up ${result.count} old sessions`
      );
      return result.count;
    } catch (error) {
      console.error(
        `[DatabaseSessionStore] Error cleaning up old sessions:`,
        error
      );
      return 0;
    }
  }
}

// Export singleton instance
export const databaseSessionStore = new DatabaseSessionStore();
