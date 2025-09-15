import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { AssessmentAI } from '@/lib/ai/AssessmentAI'
import { z } from 'zod'

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required')
})

export async function POST(
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

    if (assessment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Assessment is already completed' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = chatSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { message } = validation.data

    // Initialize AssessmentAI
    const assessmentAI = new AssessmentAI(assessmentId)
    await assessmentAI.initialize()

    // Handle initial greeting
    if (message === 'start_assessment') {
      return NextResponse.json({
        message: "Hello! I'm here to conduct a behavioral assessment. This conversation will help me understand your thoughts, feelings, and experiences. Please feel free to share openly and honestly. To begin, can you tell me how you've been feeling lately?",
        scores: [],
        isComplete: false
      })
    }

    // Process the user's response
    const response = await assessmentAI.processResponse(message)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Assessment chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}