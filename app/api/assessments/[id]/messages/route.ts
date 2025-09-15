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

    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: { assessmentId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        timestamp: true
      }
    })

    return NextResponse.json({
      messages,
      status: assessment.status
    })
  } catch (error) {
    console.error('Get assessment messages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}