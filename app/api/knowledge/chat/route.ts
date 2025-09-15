import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { KnowledgeAI } from '@/lib/ai/KnowledgeAI'
import { DocumentCategory } from '@prisma/client'
import { z } from 'zod'

const chatSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  message: z.string().min(1, 'Message is required'),
  categories: z.array(z.nativeEnum(DocumentCategory)).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = chatSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { sessionId, message, categories } = validation.data

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

    // Initialize KnowledgeAI
    const knowledgeAI = new KnowledgeAI(sessionId, session.user.id)
    await knowledgeAI.initialize()

    // Process the query
    const response = await knowledgeAI.processQuery(message, categories)

    // Update session title if it's the first message
    const messageCount = await prisma.chatMessage.count({
      where: { sessionId }
    })

    if (messageCount <= 2) { // User message + assistant response
      const title = message.length > 50 ? `${message.substring(0, 47)}...` : message
      await KnowledgeAI.updateSessionTitle(sessionId, title)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Knowledge chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}