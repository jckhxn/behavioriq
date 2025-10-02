import { assessmentRepository } from "@/lib/db/repositories/assessment-repository";
import {
  calculateAllDomainScores,
  type DomainKey,
} from "@/lib/assessment/domain-mapper";
import type { AssessmentType } from "@/lib/config/assessment";

export class AssessmentService {
  /**
   * ✅ FIX: Calculate scores correctly per domain
   * This fixes the bug where scores were inaccurate
   */
  async calculateScores(assessmentId: string) {
    const assessment = await assessmentRepository.findById(assessmentId, {
      responses: {
        orderBy: { timestamp: "asc" },
      },
    });

    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    const responses = (assessment as any).responses;

    if (!responses || responses.length === 0) {
      throw new Error(`No responses found for assessment: ${assessmentId}`);
    }

    // Transform responses to expected format
    const formattedResponses = responses.map((r: any) => ({
      questionId: r.questionId,
      response: r.response,
    }));

    // Calculate domain scores using the fixed domain mapper
    const domainScores = calculateAllDomainScores(formattedResponses);

    // Update assessment with scores
    await assessmentRepository.update(assessmentId, {
      scores: domainScores as any,
    });

    console.log(
      `[AssessmentService] ✅ Calculated scores for assessment: ${assessmentId}`
    );
    return domainScores;
  }

  /**
   * Complete an assessment with scores
   */
  async completeAssessment(
    assessmentId: string
  ): Promise<{ scores: Record<DomainKey, any> }> {
    // Calculate scores
    const scores = await this.calculateScores(assessmentId);

    // Mark as completed
    await assessmentRepository.update(assessmentId, {
      status: "COMPLETED",
      completedAt: new Date(),
    });

    console.log(`[AssessmentService] ✅ Completed assessment: ${assessmentId}`);
    return { scores };
  }

  /**
   * Get assessment with properly formatted scores
   */
  async getAssessmentWithScores(assessmentId: string) {
    const assessment =
      await assessmentRepository.findWithFullDetails(assessmentId);

    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    // Normalize scores to consistent format
    const normalizedScores = this.normalizeScores((assessment as any).scores);

    return {
      ...assessment,
      scores: normalizedScores,
    };
  }

  /**
   * Normalize scores from database to consistent format
   * Handles both old and new score formats
   */
  private normalizeScores(scores: any): Record<string, any> {
    if (!scores || typeof scores !== "object") {
      return {};
    }

    const normalized: Record<string, any> = {};

    for (const [domain, data] of Object.entries(scores)) {
      // Handle both { score: X, severity: Y } and just { score: X } or just X
      if (typeof data === "object" && data !== null) {
        normalized[domain] = {
          score: Number((data as any).score ?? 0),
          severity: (data as any).severity ?? "Low",
          count: (data as any).count ?? 0,
          rawData: data,
        };
      } else {
        // Legacy format: just a number
        normalized[domain] = {
          score: Number(data ?? 0),
          severity: this.getSeverityFromScore(Number(data ?? 0)),
          count: 0,
          rawData: data,
        };
      }
    }

    return normalized;
  }

  /**
   * Map numeric score to severity label
   */
  private getSeverityFromScore(score: number): string {
    if (score < 0.5) return "Low";
    if (score < 1.0) return "Moderate";
    if (score < 1.5) return "High";
    if (score < 2.0) return "Very High";
    return "Severe";
  }

  /**
   * Generate AI analysis for completed assessment
   * TODO: Integrate with AssessmentAI.ts
   */
  async generateAIAnalysis(assessmentId: string) {
    const assessment =
      await assessmentRepository.findWithFullDetails(assessmentId);

    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    // TODO: Integrate with AssessmentAI.ts for actual AI generation
    // For now, return placeholder
    return {
      summary: "AI analysis will be generated here",
      recommendations: [],
      resources: [],
    };
  }

  /**
   * Get assessment statistics for a user
   */
  async getUserAssessmentStats(userId: string) {
    const assessments = await assessmentRepository.findByUser(userId, {
      includeResponses: false,
    });

    const completed = assessments.filter((a) => a.status === "COMPLETED");
    const inProgress = assessments.filter((a) => a.status === "IN_PROGRESS");

    return {
      total: assessments.length,
      completed: completed.length,
      inProgress: inProgress.length,
      completionRate:
        assessments.length > 0
          ? (completed.length / assessments.length) * 100
          : 0,
    };
  }
}

export const assessmentService = new AssessmentService();
