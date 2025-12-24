/**
 * District Audit Log Service
 * FERPA-compliant audit logging for district operations
 */

import { prisma } from "@/lib/db/prisma";

export type AuditAction =
  | "VIEW_REPORT"
  | "DOWNLOAD_PDF"
  | "MARK_REVIEWED"
  | "GENERATE_SHARE_LINK"
  | "VIEW_STUDENT_LIST"
  | "VIEW_STUDENT_DETAILS"
  | "EXPORT_DATA"
  | "GENERATE_RECOMMENDATIONS";

export interface AuditLogInput {
  districtId?: string;
  studentId?: string;
  userId: string;
  action: AuditAction;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export class AuditLogService {
  /**
   * Create an audit log entry
   */
  static async log(input: AuditLogInput): Promise<void> {
    try {
      await prisma.districtAuditLog.create({
        data: {
          districtId: input.districtId,
          studentId: input.studentId,
          userId: input.userId,
          action: input.action,
          resourceId: input.resourceId,
          metadata: input.metadata || {},
          ipAddress: input.ipAddress,
        },
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Get audit logs for a district
   */
  static async getDistrictLogs(
    districtId: string,
    options: {
      limit?: number;
      offset?: number;
      action?: AuditAction;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const where: any = { districtId };

    if (options.action) {
      where.action = options.action;
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    const logs = await prisma.districtAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options.limit || 100,
      skip: options.offset || 0,
      include: {
        student: {
          select: {
            anonymousId: true,
            gradeLevel: true,
          },
        },
      },
    });

    return logs;
  }

  /**
   * Get audit logs for a specific student
   */
  static async getStudentLogs(
    studentId: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const logs = await prisma.districtAuditLog.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: options.limit || 50,
      skip: options.offset || 0,
    });

    return logs;
  }

  /**
   * Get audit summary for compliance reporting
   */
  static async getAuditSummary(
    districtId: string,
    startDate: Date,
    endDate: Date
  ) {
    const logs = await prisma.districtAuditLog.findMany({
      where: {
        districtId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Group by action
    const actionCounts: Record<string, number> = {};
    const uniqueUsers = new Set<string>();
    const uniqueStudents = new Set<string>();

    for (const log of logs) {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      uniqueUsers.add(log.userId);
      if (log.studentId) uniqueStudents.add(log.studentId);
    }

    return {
      totalLogs: logs.length,
      uniqueUsers: uniqueUsers.size,
      uniqueStudents: uniqueStudents.size,
      actionBreakdown: actionCounts,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  }
}
