/**
 * POST /api/trial/answer
 *
 * Record a single answer to a trial assessment question
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, answer } = await request.json();

    if (!sessionId || !questionId) {
      return NextResponse.json(
        { error: 'Session ID and question ID are required' },
        { status: 400 }
      );
    }

    // Get current session
    const session = await prisma.trialSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Parse existing answers
    const existingAnswers = Array.isArray(session.answers) ? session.answers : [];

    // Add new answer (or update if exists)
    const newAnswers = [
      ...existingAnswers.filter((a: any) => a.questionId !== questionId),
      { questionId, answer, answeredAt: new Date().toISOString() },
    ];

    // Parse existing questions list
    const questionsList = Array.isArray(session.questions) ? session.questions : [];
    const newQuestions = questionsList.includes(questionId)
      ? questionsList
      : [...questionsList, questionId];

    // Update session
    const updated = await prisma.trialSession.update({
      where: { id: sessionId },
      data: {
        answers: newAnswers,
        questions: newQuestions,
      },
    });

    return NextResponse.json({
      sessionId: updated.id,
      answered: newAnswers.length,
      message: 'Answer recorded',
    });
  } catch (error) {
    console.error('[Trial Answer API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to record answer' },
      { status: 500 }
    );
  }
}
