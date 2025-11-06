/**
 * POST /api/trial/start
 *
 * Start a new trial session for anonymous users
 * Returns sessionId and trial assessment data
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { anonymous, region, utm } = await request.json();

    // Create a new trial session
    const trialSession = await prisma.trialSession.create({
      data: {
        childAge: 0, // Will be updated during profile step
        relationshipType: 'other',
        status: 'started',
        questions: [],
        answers: [],
      },
    });

    return NextResponse.json({
      sessionId: trialSession.id,
      message: 'Trial session started',
    });
  } catch (error) {
    console.error('[Trial Start API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to start trial session' },
      { status: 500 }
    );
  }
}
