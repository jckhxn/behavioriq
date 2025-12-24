/**
 * Assessment Completion Hook for District Integration
 *
 * This service automatically:
 * 1. Creates StudentAssessment record when assessment completes
 * 2. Generates AI recommendations for full assessments
 * 3. Calculates flagged domains
 * 4. Creates audit log entry
 *
 * USAGE: Call this function in your assessment completion handler
 */

import { prisma } from "@/lib/db/prisma";
import {
  generateRecommendations,
  saveRecommendations,
  determineRiskTier,
} from "@/lib/district/ai-recommendations";
import { AuditLogService } from "@/lib/district/audit-log-service";

interface AssessmentCompletionData {
  assessmentId: string;
  userId: string;
  mode: "TRIAL" | "FULL";
}

/**
 * Handle assessment completion for district students
 * Call this when an assessment is marked as completed
 */
export async function handleAssessmentCompletion(
  data: AssessmentCompletionData
) {
  const { assessmentId, userId, mode } = data;

  try {
    // Get assessment with scores
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        scores: true,
        user: {
          include: {
            teacherProfile: true,
          },
        },
      },
    });

    if (!assessment) {
      console.error(`Assessment ${assessmentId} not found`);
      return;
    }

    // Check if user is a student in a district
    // For MVP, we'll need to determine studentId from assessment
    // This might come from assessment.childprofileid or a separate mapping
    const studentId = await findStudentIdForAssessment(assessment);

    if (!studentId) {
      // Not a district student, skip district-specific processing
      console.log(`Assessment ${assessmentId} is not for a district student`);
      return;
    }

    // Get student to find district
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      console.error(`Student ${studentId} not found`);
      return;
    }

    // Calculate flagged domains
    const flaggedDomains: string[] = [];
    for (const score of assessment.scores) {
      if (score.rawScore >= 70) {
        flaggedDomains.push(score.domainName || score.domain || "Unknown");
      }
    }

    // Create or update StudentAssessment record
    const studentAssessment = await prisma.studentAssessment.upsert({
      where: {
        assessmentId: assessmentId,
      },
      create: {
        studentId: student.id,
        assessmentId: assessmentId,
        isTrial: mode === "TRIAL",
        trialCompletedAt: mode === "TRIAL" ? new Date() : null,
        fullCompletedAt: mode === "FULL" ? new Date() : null,
        flaggedDomains: flaggedDomains,
      },
      update: {
        isTrial: mode === "TRIAL",
        trialCompletedAt: mode === "TRIAL" ? new Date() : undefined,
        fullCompletedAt: mode === "FULL" ? new Date() : undefined,
        flaggedDomains: flaggedDomains,
      },
    });

    console.log(
      `✅ Created/updated StudentAssessment for ${student.anonymousId}`
    );

    // Generate AI recommendations for full assessments
    if (mode === "FULL" && assessment.scores.length > 0) {
      const domainScores = assessment.scores.map((score) => ({
        domain: score.domainName || score.domain || "Unknown",
        rawScore: score.rawScore,
        riskLevel: score.riskLevel,
        totalPossible: score.totalPossible,
      }));

      const riskTier = determineRiskTier(domainScores);

      console.log(`🤖 Generating AI recommendations (Risk: ${riskTier})...`);

      const recommendations = await generateRecommendations({
        domainScores,
        gradeLevel: student.gradeLevel || undefined,
        ageBand: student.gradeLevel || undefined,
        riskTier,
      });

      await saveRecommendations(student.id, assessmentId, recommendations);

      console.log(`✅ AI recommendations generated for ${student.anonymousId}`);

      // Create audit log for recommendation generation
      await AuditLogService.log({
        districtId: student.districtId,
        studentId: student.id,
        userId: userId,
        action: "GENERATE_RECOMMENDATIONS",
        resourceId: assessmentId,
        metadata: {
          riskTier,
          flaggedDomains,
          recommendationSummary: recommendations.summary,
        },
      });
    }

    // Log assessment completion
    await AuditLogService.log({
      districtId: student.districtId,
      studentId: student.id,
      userId: userId,
      action: "VIEW_REPORT",
      resourceId: assessmentId,
      metadata: {
        mode,
        flaggedDomains,
        completedAt: new Date(),
      },
    });

    console.log(`✅ Assessment completion handled for ${student.anonymousId}`);
  } catch (error) {
    console.error("Error handling assessment completion:", error);
    // Don't throw - this is a background task, should not break main flow
  }
}

/**
 * Find student ID from assessment
 * This logic depends on how students are linked to assessments in your system
 */
async function findStudentIdForAssessment(
  assessment: any
): Promise<string | null> {
  // Option 1: Direct link via childprofileid
  if (assessment.childprofileid) {
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: assessment.childprofileid },
    });

    if (childProfile) {
      // Look for student with matching user
      const student = await prisma.student.findFirst({
        where: {
          // You may need to add a userId field to Student model
          // or use another identifier to match child profile to student
        },
      });

      if (student) return student.id;
    }
  }

  // Option 2: Check if StudentAssessment already exists
  const existingLink = await prisma.studentAssessment.findUnique({
    where: { assessmentId: assessment.id },
  });

  if (existingLink) return existingLink.studentId;

  // Option 3: Match by subjectName if it's an anonymous ID
  if (assessment.subjectName?.startsWith("STU-")) {
    const student = await prisma.student.findFirst({
      where: { anonymousId: assessment.subjectName },
    });

    if (student) return student.id;
  }

  return null;
}

/**
 * Example usage in your assessment completion endpoint
 */
export async function exampleUsage() {
  // In app/api/assessment/[id]/complete/route.ts or similar:
  /*
  import { handleAssessmentCompletion } from "@/lib/district/assessment-completion";

  export async function POST(req: NextRequest, { params }: any) {
    const { id: assessmentId } = await params;
    const user = await getCurrentUser();

    // ... your existing completion logic ...

    // Mark assessment as complete
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Trigger district integration
    await handleAssessmentCompletion({
      assessmentId,
      userId: user.id,
      mode: assessment.mode, // "TRIAL" or "FULL"
    });

    return NextResponse.json({ success: true });
  }
  */
}
