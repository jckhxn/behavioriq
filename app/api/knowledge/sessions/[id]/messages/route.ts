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

    const sessionId = params.id

    // Verify session belongs to user
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
        type: 'KNOWLEDGE'
      }
    })

    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        sources: true,
        timestamp: true
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Get knowledge session messages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}