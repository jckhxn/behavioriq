/**
 * POST /api/reports/generate
 *
 * Generate assessment report as PDF
 * Returns PDF as file download or stream
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRole } from '@/lib/supabase/auth-helpers';
import { prisma } from '@/lib/db/prisma';
import {
  generateAssessmentReportBuffer,
  generateAssessmentReportStream,
  generateReportFileName,
} from '@/lib/reports/react-pdf-generator';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUserWithRole();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { assessmentId, format = 'buffer' } = await request.json();

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'assessmentId is required' },
        { status: 400 }
      );
    }

    // Fetch assessment with all required data
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        scores: true,
        assessmentTemplate: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (assessment.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch AI recommendations if available
    const aiReport = await prisma.aIReport.findUnique({
      where: { assessmentId },
      select: {
        content: true,
      },
    });

    const aiRecommendations = aiReport?.content || 'No AI recommendations available';

    // Generate PDF based on format
    if (format === 'stream') {
      // Stream the PDF directly
      const stream = await generateAssessmentReportStream(
        {
          assessment: assessment as any,
          aiRecommendations,
          generatedAt: new Date(),
        },
        {
          includeCharts: true,
          includeRecommendations: true,
          includeDetailedResponses: false,
          includeTrends: false,
        }
      );

      const fileName = generateReportFileName(assessment, assessment.user?.name || undefined);

      return new NextResponse(stream as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    } else {
      // Return as buffer/blob (default)
      const buffer = await generateAssessmentReportBuffer(
        {
          assessment: assessment as any,
          aiRecommendations,
          generatedAt: new Date(),
        },
        {
          includeCharts: true,
          includeRecommendations: true,
          includeDetailedResponses: false,
          includeTrends: false,
        }
      );

      const fileName = generateReportFileName(assessment, assessment.user?.name || undefined);

      return new NextResponse(buffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    }
  } catch (error) {
    console.error('[ReportGenerate API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate report',
      },
      { status: 500 }
    );
  }
}
