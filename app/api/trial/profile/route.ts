/**
 * POST /api/trial/profile
 *
 * Update trial session profile information
 * Stores age band and grade band for the assessment
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, ageBand, gradeBand, relationshipType } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get the age value from age band for storage
    const ageMap: Record<string, number> = {
      '3-5': 4,
      '6-8': 7,
      '9-12': 10,
      '13-18': 15,
    };

    const age = ageMap[ageBand] || 0;

    // Update trial session with profile information
    const updated = await prisma.trialSession.update({
      where: { id: sessionId },
      data: {
        childAge: age,
        relationshipType: relationshipType || 'other',
        status: 'in_progress',
        // Store metadata about the assessment
        questions: {
          ageBand,
          gradeBand,
          relationshipType,
        },
      },
    });

    return NextResponse.json({
      sessionId: updated.id,
      message: 'Profile updated',
    });
  } catch (error) {
    console.error('[Trial Profile API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
