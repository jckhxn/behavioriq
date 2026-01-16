/**
 * GET /api/district/students/[id]/report
 * Generate PDF report for a student's assessment
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getDistrictUser,
  canAccessStudent,
} from "@/lib/district/access-control";
import { prisma } from "@/lib/db/prisma";
import { generateAssessmentPDF } from "@/lib/pdf/generator";
import { isFeatureEnabled } from "@/lib/district/feature-flags";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const user = await getDistrictUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check feature flag
    const canExportPDF = await isFeatureEnabled("pdf_export", user.role);
    if (!canExportPDF.enabled) {
      return NextResponse.json(
        { error: "PDF export is disabled" },
        { status: 403 }
      );
    }

    // Check access to student
    const hasAccess = await canAccessStudent(user.id, studentId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this student" },
        { status: 403 }
      );
    }

    // Get student with latest completed assessment
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        assessments: {
          where: {
            assessment: {
              status: "COMPLETED",
            },
          },
          include: {
            assessment: {
              include: {
                scores: true,
                domainIndicators: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        recommendations: {
          orderBy: {
            generatedAt: "desc",
          },
          take: 1,
        },
        district: {
          select: {
            name: true,
          },
        },
        school: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const latestAssessment = student.assessments[0]?.assessment;
    if (!latestAssessment) {
      return NextResponse.json(
        { error: "No completed assessment found for this student" },
        { status: 404 }
      );
    }

    // Prepare assessment data for PDF generation
    const assessmentData = {
      id: latestAssessment.id,
      subjectName:
        student.consentGiven && student.firstName
          ? `${student.firstName} ${student.lastName || ""}`.trim()
          : `Student ${student.anonymousId}`,
      startedAt:
        latestAssessment.startedAt?.toISOString() || new Date().toISOString(),
      completedAt: latestAssessment.completedAt?.toISOString() || null,
      status: latestAssessment.status,
      scores: latestAssessment.scores.map((score) => ({
        domain: score.domain?.toString() || "Unknown",
        domainName: score.domainName || score.domain?.toString() || "Unknown",
        rawScore: score.rawScore,
        totalPossible: score.totalPossible,
        riskLevel: score.riskLevel,
      })),
      domainIndicators: latestAssessment.domainIndicators.map((di) => ({
        domain: di.domainName,
        flagged: di.flagged,
      })),
      user: {
        name: student.consentGiven
          ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
          : null,
        email: "", // Not applicable for students
      },
      // Additional district-specific info
      district: student.district?.name || "Unknown District",
      school: student.school?.name || "Unknown School",
      gradeLevel: student.gradeLevel || "Unknown",
      anonymousId: student.anonymousId,
      recommendations: student.recommendations[0] || null,
    };

    // Generate PDF
    const pdfBuffer = await generateAssessmentPDF(assessmentData);

    // Log the report generation
    await prisma.districtAuditLog.create({
      data: {
        districtId: student.districtId,
        studentId: student.id,
        userId: user.id,
        action: "GENERATE_REPORT_PDF",
        resourceId: latestAssessment.id,
        metadata: {
          assessmentId: latestAssessment.id,
          anonymousId: student.anonymousId,
        },
      },
    });

    // Update StudentAssessment with PDF info (could store in S3 later)
    await prisma.studentAssessment.updateMany({
      where: {
        studentId: student.id,
        assessmentId: latestAssessment.id,
      },
      data: {
        pdfUrl: `/api/district/students/${student.id}/report`, // Self-referential for now
      },
    });

    // Return PDF
    const filename = `screening-report-${student.anonymousId}-${new Date().toISOString().split("T")[0]}.pdf`;

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfArray = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfArray, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating student report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
