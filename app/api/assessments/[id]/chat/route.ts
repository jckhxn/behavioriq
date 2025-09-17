import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { AssessmentAI } from '@/lib/ai/AssessmentAI'
import { ASSESSMENT_CONFIG } from '@/lib/config/ai-config'
import { z } from 'zod'

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required')
})

const structuredResponseSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  response: z.boolean()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assessmentId = (await params).id

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

    // Initialize AssessmentAI
    const assessmentAI = new AssessmentAI(assessmentId)
    await assessmentAI.initialize()

    // Check assessment mode
    const isStructuredMode = ASSESSMENT_CONFIG.CURRENT_MODE === 'structured'

    if (isStructuredMode) {
      // Handle structured assessment
      if (body.message === 'start_assessment') {
        // Get the first question
        const initialQuestion = await assessmentAI.getInitialStructuredQuestion()

        if (!initialQuestion) {
          return NextResponse.json(
            { error: 'Failed to get initial question' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: "Welcome to the behavioral assessment. You'll be asked a series of yes/no questions across different behavioral domains. Please answer honestly - there are no right or wrong answers.",
          nextQuestion: initialQuestion.text,
          questionId: initialQuestion.questionId,
          currentDomain: initialQuestion.domain,
          scores: [],
          isComplete: false,
          progress: {
            totalQuestions: 0,
            answeredQuestions: 0,
            completedDomains: 0,
            overallProgress: 0
          }
        })
      }

      // Validate structured response
      const structuredValidation = structuredResponseSchema.safeParse(body)
      if (!structuredValidation.success) {
        return NextResponse.json(
          { error: structuredValidation.error.errors[0].message },
          { status: 400 }
        )
      }

      // Process structured response
      const response = await assessmentAI.processStructuredResponse(structuredValidation.data)
      return NextResponse.json(response)

    } else {
      // Handle conversational assessment
      const validation = chatSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        )
      }

      const { message } = validation.data

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
    }
  } catch (error) {
    console.error('Assessment chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}