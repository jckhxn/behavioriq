/**
 * District Service
 * Core business logic for district operations
 */

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export interface DistrictMetrics {
  totalStudents: number;
  studentsScreened: number;
  flaggedStudents: number;
  flaggedPercentage: number;
  averageRiskScore: number;
  domainBreakdown: {
    anxiety: { count: number; percentage: number };
    depression: { count: number; percentage: number };
    attention: { count: number; percentage: number };
    conduct: { count: number; percentage: number };
    antisocial: { count: number; percentage: number };
  };
}

export interface DistrictFilters {
  gradeLevel?: string;
  classroomId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  flaggedOnly?: boolean;
  teacherId?: string;
}

export class DistrictService {
  /**
   * Get district metrics with optional filters
   */
  static async getDistrictMetrics(
    districtId: string,
    filters: DistrictFilters = {}
  ): Promise<DistrictMetrics> {
    const whereClause: Prisma.StudentWhereInput = {
      districtId,
      isActive: true,
    };

    // Apply filters
    if (filters.gradeLevel) {
      whereClause.gradeLevel = filters.gradeLevel;
    }

    if (filters.classroomId) {
      whereClause.classrooms = {
        some: { classroomId: filters.classroomId },
      };
    }

    // Get total students
    const totalStudents = await prisma.student.count({ where: whereClause });

    // Get students with assessments (screened)
    const studentsWithAssessments = await prisma.student.findMany({
      where: {
        ...whereClause,
        assessments: {
          some: {
            assessment: {
              status: "COMPLETED",
              ...(filters.dateFrom || filters.dateTo
                ? {
                    completedAt: {
                      ...(filters.dateFrom && { gte: filters.dateFrom }),
                      ...(filters.dateTo && { lte: filters.dateTo }),
                    },
                  }
                : {}),
            },
          },
        },
      },
      include: {
        assessments: {
          include: {
            assessment: {
              include: {
                scores: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    const studentsScreened = studentsWithAssessments.length;

    // Calculate metrics
    let flaggedCount = 0;
    let totalRiskScore = 0;
    let scoreCount = 0;

    const domainCounts = {
      anxiety: 0,
      depression: 0,
      attention: 0,
      conduct: 0,
      antisocial: 0,
    };

    for (const student of studentsWithAssessments) {
      const latestAssessment = student.assessments[0];
      if (!latestAssessment?.assessment) continue;

      const scores = latestAssessment.assessment.scores;
      let studentFlagged = false;

      for (const score of scores) {
        // Flag threshold: rawScore >= 70
        if (score.rawScore >= 70) {
          studentFlagged = true;

          // Map domain to category
          const domainName = score.domainName?.toLowerCase() || "";
          if (domainName.includes("anxiety")) domainCounts.anxiety++;
          else if (domainName.includes("depression")) domainCounts.depression++;
          else if (domainName.includes("attention")) domainCounts.attention++;
          else if (
            domainName.includes("conduct") ||
            domainName.includes("oppositional")
          )
            domainCounts.conduct++;
          else if (
            domainName.includes("antisocial") ||
            domainName.includes("violence")
          )
            domainCounts.antisocial++;
        }

        totalRiskScore += score.rawScore;
        scoreCount++;
      }

      if (studentFlagged) flaggedCount++;
    }

    const averageRiskScore = scoreCount > 0 ? totalRiskScore / scoreCount : 0;
    const flaggedPercentage =
      studentsScreened > 0 ? (flaggedCount / studentsScreened) * 100 : 0;

    return {
      totalStudents,
      studentsScreened,
      flaggedStudents: flaggedCount,
      flaggedPercentage: Math.round(flaggedPercentage * 10) / 10,
      averageRiskScore: Math.round(averageRiskScore * 10) / 10,
      domainBreakdown: {
        anxiety: {
          count: domainCounts.anxiety,
          percentage:
            studentsScreened > 0
              ? Math.round((domainCounts.anxiety / studentsScreened) * 1000) /
                10
              : 0,
        },
        depression: {
          count: domainCounts.depression,
          percentage:
            studentsScreened > 0
              ? Math.round(
                  (domainCounts.depression / studentsScreened) * 1000
                ) / 10
              : 0,
        },
        attention: {
          count: domainCounts.attention,
          percentage:
            studentsScreened > 0
              ? Math.round((domainCounts.attention / studentsScreened) * 1000) /
                10
              : 0,
        },
        conduct: {
          count: domainCounts.conduct,
          percentage:
            studentsScreened > 0
              ? Math.round((domainCounts.conduct / studentsScreened) * 1000) /
                10
              : 0,
        },
        antisocial: {
          count: domainCounts.antisocial,
          percentage:
            studentsScreened > 0
              ? Math.round(
                  (domainCounts.antisocial / studentsScreened) * 1000
                ) / 10
              : 0,
        },
      },
    };
  }

  /**
   * Get student list for district with optional filters
   */
  static async getStudentList(
    districtId: string,
    filters: DistrictFilters = {},
    teacherId?: string
  ) {
    const whereClause: Prisma.StudentWhereInput = {
      districtId,
      isActive: true,
    };

    // Teacher can only see their assigned students
    if (teacherId) {
      whereClause.classrooms = {
        some: {
          classroom: {
            teachers: {
              some: { teacherId },
            },
          },
        },
      };
    }

    // Apply filters
    if (filters.gradeLevel) {
      whereClause.gradeLevel = filters.gradeLevel;
    }

    if (filters.classroomId) {
      whereClause.classrooms = {
        some: { classroomId: filters.classroomId },
      };
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        school: {
          select: { name: true },
        },
        assessments: {
          include: {
            assessment: {
              include: {
                scores: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        classrooms: {
          include: {
            classroom: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Apply flagged filter after fetching
    let filteredStudents = students;
    if (filters.flaggedOnly) {
      filteredStudents = students.filter((student) => {
        const latestAssessment = student.assessments[0];
        if (!latestAssessment?.assessment) return false;
        return latestAssessment.assessment.scores.some(
          (score) => score.rawScore >= 70
        );
      });
    }

    return filteredStudents.map((student) => {
      const latestAssessment = student.assessments[0];
      const assessment = latestAssessment?.assessment;

      let status: "none" | "trial" | "full" = "none";
      if (latestAssessment) {
        status = latestAssessment.isTrial ? "trial" : "full";
      }

      const flaggedDomains: string[] = [];
      if (assessment) {
        for (const score of assessment.scores) {
          if (score.rawScore >= 70) {
            flaggedDomains.push(score.domainName || score.domain || "Unknown");
          }
        }
      }

      return {
        id: student.id,
        anonymousId: student.anonymousId,
        gradeLevel: student.gradeLevel,
        school: student.school?.name,
        classrooms: student.classrooms.map((c) => c.classroom.name),
        assessmentStatus: status,
        assessmentId: assessment?.id,
        flaggedDomains,
        consentGiven: student.consentGiven,
        isAnonymous: student.isAnonymous,
        completedAt: assessment?.completedAt,
      };
    });
  }

  /**
   * Get student details for district view
   */
  static async getStudentDetails(studentId: string, requestingUserId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        district: true,
        school: true,
        assessments: {
          include: {
            assessment: {
              include: {
                scores: true,
                recommendations: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        recommendations: {
          orderBy: {
            generatedAt: "desc",
          },
          take: 1,
        },
        classrooms: {
          include: {
            classroom: {
              include: {
                teachers: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Get requesting user to verify access
    const user = await prisma.user.findUnique({
      where: { id: requestingUserId },
      include: { teacherProfile: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Access control
    if (user.role === "TEACHER") {
      // Teacher can only view their assigned students
      const hasAccess = student.classrooms.some((sc) =>
        sc.classroom.teachers?.some(
          (tc: any) => tc.teacherId === user.teacherProfile?.id
        )
      );
      if (!hasAccess) {
        throw new Error("Access denied: student not in your classroom");
      }
    } else if (user.role === "DISTRICT_ADMIN") {
      // District admin can view any student in their district
      // (We would need to add districtId to user model or use organization mapping)
      // For now, assume access is granted
    }

    return student;
  }

  /**
   * Mark student report as reviewed
   */
  static async markAsReviewed(
    studentId: string,
    assessmentId: string,
    reviewedBy: string
  ) {
    const studentAssessment = await prisma.studentAssessment.findFirst({
      where: {
        studentId,
        assessmentId,
      },
    });

    if (!studentAssessment) {
      throw new Error("Student assessment not found");
    }

    return prisma.studentAssessment.update({
      where: { id: studentAssessment.id },
      data: {
        reviewedAt: new Date(),
        reviewedBy,
      },
    });
  }
}
