/**
 * POST /api/trial/score
 *
 * Calculate trial assessment scores and return results
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get trial session
    const session = await prisma.trialSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Parse answers
    const answers = Array.isArray(session.answers) ? session.answers : [];

    // Calculate basic scores
    // For a trial, we'll use a simple scoring: count "yes" (value: 3) answers
    const totalAnswered = answers.length;
    const yesCount = answers.filter((a: any) => a.answer === 3).length;
    const noCount = answers.filter((a: any) => a.answer === 0).length;

    // Calculate percentage
    const scorePercentage = totalAnswered > 0 ? (yesCount / totalAnswered) * 100 : 0;

    // Determine risk level based on score
    let riskLevel = 'low';
    if (scorePercentage >= 70) {
      riskLevel = 'elevated';
    } else if (scorePercentage >= 40) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'low';
    }

    // Update session as completed
    const updated = await prisma.trialSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Return results
    return NextResponse.json({
      sessionId: updated.id,
      results: {
        totalQuestions: totalAnswered,
        yesCount,
        noCount,
        scorePercentage: Math.round(scorePercentage),
        riskLevel,
        timestamp: updated.completedAt,
      },
      message: 'Assessment completed',
    });
  } catch (error) {
    console.error('[Trial Score API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate scores' },
      { status: 500 }
    );
  }
}
