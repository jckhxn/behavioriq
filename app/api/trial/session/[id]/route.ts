/**
 * GET /api/trial/session/[id]
 *
 * Get trial session metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get the trial session
    const session = await prisma.trialSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        childAge: true,
        relationshipType: true,
        status: true,
        startedAt: true,
        completedAt: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      childAge: session.childAge,
      relationshipType: session.relationshipType,
      status: session.status,
      anonymous: true, // Trial sessions are always anonymous by default
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    });
  } catch (error) {
    console.error('[Trial Session Metadata API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get trial session' },
      { status: 500 }
    );
  }
}
