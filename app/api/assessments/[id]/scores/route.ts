import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assessmentId = params.id

    // Verify assessment belongs to user
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id
      }
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Get all scores
    const scores = await prisma.score.findMany({
      where: { assessmentId },
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        domain: true,
        rawScore: true,
        riskLevel: true,
        confidence: true,
        timestamp: true
      }
    })

    // Get message count
    const messageCount = await prisma.chatMessage.count({
      where: { 
        assessmentId,
        role: 'USER'
      }
    })

    return NextResponse.json({
      scores,
      status: assessment.status,
      messageCount
    })
  } catch (error) {
    console.error('Get assessment scores error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}