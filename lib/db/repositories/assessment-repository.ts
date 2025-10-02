import { prisma } from "@/lib/db/prisma";
import type { Assessment, Prisma } from "@prisma/client";

export class AssessmentRepository {
  /**
   * Create new assessment
   */
  async create(data: Prisma.AssessmentCreateInput): Promise<Assessment> {
    return prisma.assessment.create({ data });
  }

  /**
   * Find assessment by ID with relations
   */
  async findById(
    id: string,
    include?: Prisma.AssessmentInclude
  ): Promise<Assessment | null> {
    return prisma.assessment.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Find all assessments for a user
   */
  async findByUser(
    userId: string,
    options?: {
      includeResponses?: boolean;
      limit?: number;
      orderBy?: Prisma.AssessmentOrderByWithRelationInput;
    }
  ): Promise<Assessment[]> {
    return prisma.assessment.findMany({
      where: { userId },
      include: {
        responses: options?.includeResponses,
      },
      take: options?.limit,
      orderBy: options?.orderBy,
    });
  }

  /**
   * Update assessment
   */
  async update(
    id: string,
    data: Prisma.AssessmentUpdateInput
  ): Promise<Assessment> {
    return prisma.assessment.update({
      where: { id },
      data,
    });
  }

  /**
   * Mark assessment as completed
   */
  async complete(id: string, scores: Record<string, any>): Promise<Assessment> {
    return this.update(id, {
      status: "COMPLETED",
      completedAt: new Date(),
      scores: scores as any,
    });
  }

  /**
   * Unlock enhanced report
   */
  async unlockEnhancedReport(id: string): Promise<Assessment> {
    return this.update(id, {
      hasEnhancedReport: true,
      enhancedReportPurchasedAt: new Date(),
    } as any);
  }

  /**
   * Count completed assessments for user
   */
  async countCompletedByUser(userId: string): Promise<number> {
    return prisma.assessment.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    });
  }

  /**
   * Get assessment with full details (responses, user, etc.)
   */
  async findWithFullDetails(id: string) {
    return prisma.assessment.findUnique({
      where: { id },
      include: {
        responses: {
          orderBy: { timestamp: "asc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Find all completed assessments for a user
   */
  async findCompletedByUser(userId: string): Promise<Assessment[]> {
    return prisma.assessment.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      orderBy: { completedAt: "desc" },
    });
  }

  /**
   * Delete assessment and all related data
   */
  async delete(id: string): Promise<Assessment> {
    // Delete responses first (cascade should handle this, but explicit is better)
    await prisma.questionResponse.deleteMany({
      where: { assessmentId: id },
    });

    return prisma.assessment.delete({
      where: { id },
    });
  }
}

export const assessmentRepository = new AssessmentRepository();
