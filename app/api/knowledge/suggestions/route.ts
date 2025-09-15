import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { KnowledgeAI } from '@/lib/ai/KnowledgeAI'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a temporary KnowledgeAI instance to get suggestions
    const knowledgeAI = new KnowledgeAI('temp', session.user.id)
    const suggestions = await knowledgeAI.getSuggestedQuestions()

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Get suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}