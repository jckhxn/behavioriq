/**
 * GET /api/trial/session/:sessionId
 *
 * Get trial session data and next question
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET trial session data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get the trial session
    const session = await prisma.trialSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get trial assessment and questions
    const platformSettings = await prisma.platformSettings.findFirst({
      include: {
        globalTrialAssessment: {
          include: {
            domains: {
              include: {
                domainTemplate: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!platformSettings?.globalTrialAssessment) {
      return NextResponse.json(
        { error: 'No trial assessment configured' },
        { status: 404 }
      );
    }

    const trialAssessment = platformSettings.globalTrialAssessment;

    // Get only trial-flagged questions from each domain
    const allQuestions = trialAssessment.domains.flatMap((domain: any) => {
      const questions = Array.isArray(domain.domainTemplate.questions)
        ? domain.domainTemplate.questions
        : [];
      return questions
        .filter((q: any) => q.isTrial === true)
        .map((q: any, idx: number) => ({
          qid: q.id || `q-${domain.id}-${idx}`,
          text: q.text || q,
          scale: 'yesno' as const,
          context: {
            domain: domain.domainTemplate.name,
            order: idx,
          },
        }));
    });

    // Get answered question IDs from session
    const answeredIds = Array.isArray(session.questions)
      ? session.questions
      : [];

    // Find next unanswered question
    const nextQuestion =
      allQuestions.find((q) => !answeredIds.includes(q.qid)) || null;

    // Calculate progress
    const answered = answeredIds.length;
    const total = allQuestions.length;
    const percent = total > 0 ? (answered / total) * 100 : 0;
    const etaMinutes = Math.ceil((total - answered) * 0.5); // ~30 seconds per question

    return NextResponse.json({
      sessionId,
      questions: allQuestions,
      next: nextQuestion,
      progress: {
        answered,
        required: total,
        percent,
        etaMinutes,
      },
    });
  } catch (error) {
    console.error('[Trial Session API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get trial session' },
      { status: 500 }
    );
  }
}
