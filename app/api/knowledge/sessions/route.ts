import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { KnowledgeAI } from '@/lib/ai/KnowledgeAI'
import { z } from 'zod'

const createSessionSchema = z.object({
  title: z.string().min(1, 'Title is required')
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createSessionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title } = validation.data

    // Create new knowledge session
    const sessionId = await KnowledgeAI.createNewSession(session.user.id, title)

    return NextResponse.json({
      message: 'Session created successfully',
      sessionId
    })
  } catch (error) {
    console.error('Create knowledge session error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}