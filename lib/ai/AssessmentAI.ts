import { prisma } from '@/lib/db/prisma'
import { generateChatCompletion } from './openai'
import { AssessmentDomain, RiskLevel, MessageRole } from '@prisma/client'

export interface AssessmentScores {
  [AssessmentDomain.ANTISOCIAL]: number
  [AssessmentDomain.VIOLENCE]: number
  [AssessmentDomain.ATTENTION]: number
  [AssessmentDomain.EMOTIONAL]: number
  [AssessmentDomain.CONDUCT]: number
}

export interface ScoreUpdate {
  domain: AssessmentDomain
  rawScore: number
  riskLevel: RiskLevel
  confidence: number
}

export interface AssessmentResponse {
  message: string
  scores: ScoreUpdate[]
  nextQuestion?: string
  isComplete: boolean
}

export class AssessmentAI {
  private assessmentId: string
  private currentScores: AssessmentScores
  private conversationHistory: Array<{ role: MessageRole; content: string }>

  constructor(assessmentId: string) {
    this.assessmentId = assessmentId
    this.currentScores = {
      [AssessmentDomain.ANTISOCIAL]: 0,
      [AssessmentDomain.VIOLENCE]: 0,
      [AssessmentDomain.ATTENTION]: 0,
      [AssessmentDomain.EMOTIONAL]: 0,
      [AssessmentDomain.CONDUCT]: 0
    }
    this.conversationHistory = []
  }

  async initialize(): Promise<void> {
    try {
      // Load existing conversation history
      const messages = await prisma.chatMessage.findMany({
        where: { assessmentId: this.assessmentId },
        orderBy: { timestamp: 'asc' }
      })

      this.conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Load latest scores
      const latestScores = await prisma.score.findMany({
        where: { assessmentId: this.assessmentId },
        orderBy: { timestamp: 'desc' },
        distinct: ['domain']
      })

      latestScores.forEach(score => {
        this.currentScores[score.domain] = score.rawScore
      })
    } catch (error) {
      console.error('Error initializing AssessmentAI:', error)
      throw new Error('Failed to initialize assessment')
    }
  }

  async processResponse(userResponse: string): Promise<AssessmentResponse> {
    try {
      // Add user response to history
      this.conversationHistory.push({
        role: MessageRole.USER,
        content: userResponse
      })

      // Analyze response and update scores
      const analysis = await this.analyzeResponse(userResponse)
      
      // Store user message
      await prisma.chatMessage.create({
        data: {
          assessmentId: this.assessmentId,
          role: MessageRole.USER,
          content: userResponse,
          timestamp: new Date()
        }
      })

      // Update scores in database
      await this.updateScores(analysis.scores)

      // Generate next question or completion message
      const nextQuestion = analysis.isComplete 
        ? null 
        : await this.generateNextQuestion()

      const responseMessage = analysis.isComplete
        ? this.generateCompletionMessage()
        : (nextQuestion || "Please continue sharing your thoughts.")

      // Add assistant response to history
      this.conversationHistory.push({
        role: MessageRole.ASSISTANT,
        content: responseMessage
      })

      // Store assistant message
      await prisma.chatMessage.create({
        data: {
          assessmentId: this.assessmentId,
          role: MessageRole.ASSISTANT,
          content: responseMessage,
          timestamp: new Date()
        }
      })

      // Mark assessment as complete if done
      if (analysis.isComplete) {
        await prisma.assessment.update({
          where: { id: this.assessmentId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        })
      }

      return {
        message: responseMessage,
        scores: analysis.scores,
        nextQuestion: nextQuestion || undefined,
        isComplete: analysis.isComplete
      }
    } catch (error) {
      console.error('Error processing assessment response:', error)
      throw new Error('Failed to process response')
    }
  }

  private async analyzeResponse(response: string): Promise<{
    scores: ScoreUpdate[]
    isComplete: boolean
  }> {
    const systemPrompt = `You are a psychological assessment AI analyzing responses for behavioral indicators.

Analyze the user's response and provide scores for each domain on a scale of 0-100:
- ANTISOCIAL: Social withdrawal, isolation, lack of social skills
- VIOLENCE: Aggressive thoughts, violent tendencies, harm to others
- ATTENTION: Focus issues, hyperactivity, impulsivity
- EMOTIONAL: Emotional dysregulation, anxiety, depression
- CONDUCT: Rule-breaking, defiance, authority issues

For each domain, provide:
1. Raw score (0-100)
2. Risk level (LOW, MODERATE, HIGH, VERY_HIGH)
3. Confidence (0.0-1.0)

Also determine if enough information has been gathered (typically after 8-12 exchanges).

Respond ONLY with valid JSON in this format:
{
  "scores": [
    {
      "domain": "ANTISOCIAL",
      "rawScore": 25,
      "riskLevel": "LOW",
      "confidence": 0.8
    }
  ],
  "isComplete": false
}`

    try {
      const completion = await generateChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Conversation history: ${JSON.stringify(this.conversationHistory.slice(-6))}\n\nCurrent response to analyze: "${response}"` }
      ], {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 800
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from AI')
      }

      const analysis = JSON.parse(content)
      
      // Validate and update current scores
      analysis.scores.forEach((score: ScoreUpdate) => {
        this.currentScores[score.domain] = score.rawScore
      })

      return analysis
    } catch (error) {
      console.error('Error analyzing response:', error)
      // Return default neutral scores on error
      return {
        scores: Object.values(AssessmentDomain).map(domain => ({
          domain,
          rawScore: this.currentScores[domain],
          riskLevel: RiskLevel.LOW,
          confidence: 0.5
        })),
        isComplete: false
      }
    }
  }

  private async generateNextQuestion(): Promise<string | null> {
    if (this.conversationHistory.length >= 20) {
      return null // Assessment should be complete
    }

    const systemPrompt = `You are conducting a psychological assessment interview. Based on the conversation history and current assessment needs, generate the next most appropriate question.

Guidelines:
- Ask open-ended questions that encourage detailed responses
- Explore areas that need more information based on current scores
- Be empathetic and professional
- Avoid leading questions
- Focus on understanding thoughts, feelings, and behaviors
- Keep questions conversational and non-threatening

Generate ONE concise, empathetic question that will help gather more assessment information.`

    try {
      const completion = await generateChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Conversation so far: ${JSON.stringify(this.conversationHistory)}\n\nCurrent scores: ${JSON.stringify(this.currentScores)}` }
      ], {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 200
      })

      return completion.choices[0]?.message?.content || null
    } catch (error) {
      console.error('Error generating next question:', error)
      return "Can you tell me more about how you've been feeling lately?"
    }
  }

  private generateCompletionMessage(): string {
    const totalResponses = this.conversationHistory.filter(msg => msg.role === MessageRole.USER).length
    return `Thank you for completing the assessment. I've gathered valuable information from our ${totalResponses} exchanges. The assessment results are now available in your dashboard.`
  }

  private async updateScores(scores: ScoreUpdate[]): Promise<void> {
    try {
      const scorePromises = scores.map(score =>
        prisma.score.create({
          data: {
            assessmentId: this.assessmentId,
            domain: score.domain,
            rawScore: score.rawScore,
            riskLevel: score.riskLevel,
            confidence: score.confidence,
            timestamp: new Date()
          }
        })
      )

      await Promise.all(scorePromises)
    } catch (error) {
      console.error('Error updating scores:', error)
      throw new Error('Failed to update assessment scores')
    }
  }

  async getCurrentScores(): Promise<AssessmentScores> {
    return { ...this.currentScores }
  }

  static async createNewAssessment(userId: string, subjectName: string): Promise<string> {
    try {
      const assessment = await prisma.assessment.create({
        data: {
          userId,
          subjectName,
          status: 'IN_PROGRESS'
        }
      })

      return assessment.id
    } catch (error) {
      console.error('Error creating new assessment:', error)
      throw new Error('Failed to create assessment')
    }
  }
}