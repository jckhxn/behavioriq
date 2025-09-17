import { prisma } from '@/lib/db/prisma'
import { getChatCompletion } from './openai'
import { AssessmentDomain, RiskLevel, MessageRole } from '@prisma/client'
import { EARLY_DETECTION_SCREENER } from '../assessment/assessments'
import {
  ScoringCalculator,
  type QuestionResponse,
  type DomainScore
} from '../assessment/scoring'

export interface AssessmentScores {
  [key: string]: number
}

export interface ScoreUpdate {
  domain: string
  rawScore: number
  riskLevel: RiskLevel
  confidence: number
}

export interface AssessmentResponse {
  message: string
  scores: ScoreUpdate[]
  nextQuestion?: string
  questionId?: string
  currentDomain?: string
  isComplete: boolean
  progress?: {
    totalQuestions: number
    answeredQuestions: number
    completedDomains: number
    overallProgress: number
  }
  aiRecommendations?: string
}

export interface StructuredQuestionResponse {
  questionId: string
  response: boolean
}

export class AssessmentAI {
  private assessmentId: string
  private currentScores: AssessmentScores
  private conversationHistory: Array<{ role: string; content: string }>
  private questionResponses: QuestionResponse[]
  private currentQuestionIndex: number
  private currentDomainIndex: number
  private isStructuredMode: boolean

  constructor(assessmentId: string) {
    this.assessmentId = assessmentId
    this.currentScores = {}
    this.conversationHistory = []
    this.questionResponses = []
    this.currentQuestionIndex = 0
    this.currentDomainIndex = 0
    this.isStructuredMode = true // Always use structured mode per user story
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

      // Load question responses for structured mode
      const responses = await prisma.questionResponse.findMany({
        where: { assessmentId: this.assessmentId },
        orderBy: { timestamp: 'asc' }
      })

      this.questionResponses = responses.map(r => ({
        questionId: r.questionId,
        response: r.response,
        timestamp: r.timestamp
      }))

      // Calculate current progress
      this.updateCurrentProgress()
    } catch (error) {
      console.error('Error initializing AssessmentAI:', error)
      throw new Error('Failed to initialize assessment')
    }
  }

  async processStructuredResponse(questionResponse: StructuredQuestionResponse): Promise<AssessmentResponse> {
    try {
      // Store the response
      this.questionResponses.push({
        questionId: questionResponse.questionId,
        response: questionResponse.response,
        timestamp: new Date()
      })

      // Get current domain and check for skip conditions
      const currentDomain = this.getCurrentDomainFromQuestionId(questionResponse.questionId)
      const terminationCheck = ScoringCalculator.checkEarlyTermination(
        currentDomain,
        this.questionResponses
      )

      let nextQuestion = null
      let isComplete = false

      if (terminationCheck.nextQuestionId) {
        // Skip to specific question
        nextQuestion = this.getQuestionById(terminationCheck.nextQuestionId)
      } else if (this.shouldSkipCurrentDomain()) {
        // Skip to next domain
        nextQuestion = this.getNextDomainFirstQuestion()
      } else {
        // Get next question in current domain
        nextQuestion = this.getNextQuestion()
      }

      isComplete = nextQuestion === null

      // Calculate all domain scores
      const domainScores = ScoringCalculator.getAllDomainScores(this.questionResponses)

      // Generate AI recommendations if complete
      let aiRecommendations = ''
      if (isComplete) {
        aiRecommendations = await this.generateAIRecommendations(domainScores)
      }

      // Save response to database
      await this.saveQuestionResponse(questionResponse)
      
      // Update scores in database
      await this.updateStructuredScores(domainScores)

      const message = this.generateResponseMessage(
        questionResponse.response,
        nextQuestion,
        isComplete,
        aiRecommendations
      )

      return {
        message,
        scores: domainScores.map(ds => ({
          domain: ds.domain,
          rawScore: ds.score,
          riskLevel: ScoringCalculator.mapScoreToRiskLevel(ds),
          confidence: ds.isClinicallySignificant ? 0.9 : 0.7
        })),
        nextQuestion: nextQuestion?.text,
        questionId: nextQuestion?.id,
        currentDomain: currentDomain,
        isComplete,
        progress: this.calculateProgress(),
        aiRecommendations: isComplete ? aiRecommendations : undefined
      }

    } catch (error) {
      console.error('Error processing structured response:', error)
      throw new Error('Failed to process assessment response')
    }
  }

  private async generateAIRecommendations(domainScores: DomainScore[]): Promise<string> {
    const clinicallySignificantDomains = domainScores.filter(ds => ds.isClinicallySignificant)
    
    const prompt = `Based on the following assessment results, provide professional recommendations and citations:

Assessment Results:
${domainScores.map(ds => 
  `${ds.displayName}: ${ds.score}/${ds.totalPossible} (${ds.percentage.toFixed(1)}%) - ${ds.isClinicallySignificant ? 'Clinically Significant' : 'Within Normal Range'}`
).join('\n')}

Clinically Significant Areas: ${clinicallySignificantDomains.map(ds => ds.displayName).join(', ') || 'None'}

Please provide:
1. A brief interpretation of the results
2. Specific recommendations for each clinically significant area
3. General wellness recommendations
4. Professional referral suggestions if appropriate

Keep the response professional, empathetic, and actionable.`

    try {
      const response = await getChatCompletion([
        { role: 'system', content: 'You are a licensed clinical psychologist providing assessment interpretations and recommendations.' },
        { role: 'user', content: prompt }
      ])

      return response || 'Unable to generate recommendations at this time.'
    } catch (error) {
      console.error('Error generating AI recommendations:', error)
      return 'Assessment complete. Please consult with a mental health professional for interpretation and next steps.'
    }
  }

  private shouldSkipCurrentDomain(): boolean {
    if (this.currentDomainIndex >= EARLY_DETECTION_SCREENER.length) return false
    
    const currentDomain = EARLY_DETECTION_SCREENER[this.currentDomainIndex]
    const domainScore = ScoringCalculator.calculateDomainScore(currentDomain.name, this.questionResponses)
    
    return domainScore.skipped
  }

  private getCurrentDomainFromQuestionId(questionId: string): string {
    for (const domain of EARLY_DETECTION_SCREENER) {
      if (domain.questions.some(q => q.id === questionId)) {
        return domain.name
      }
    }
    throw new Error(`Domain not found for question ${questionId}`)
  }

  private getQuestionById(questionId: string) {
    for (const domain of EARLY_DETECTION_SCREENER) {
      const question = domain.questions.find(q => q.id === questionId)
      if (question) {
        return question
      }
    }
    return null
  }

  private getNextQuestion() {
    if (this.currentDomainIndex >= EARLY_DETECTION_SCREENER.length) return null
    
    const currentDomain = EARLY_DETECTION_SCREENER[this.currentDomainIndex]
    
    if (this.currentQuestionIndex < currentDomain.questions.length - 1) {
      this.currentQuestionIndex++
      return currentDomain.questions[this.currentQuestionIndex]
    } else {
      // Move to next domain
      return this.getNextDomainFirstQuestion()
    }
  }

  private getNextDomainFirstQuestion() {
    this.currentDomainIndex++
    this.currentQuestionIndex = 0
    
    if (this.currentDomainIndex >= EARLY_DETECTION_SCREENER.length) return null
    
    const nextDomain = EARLY_DETECTION_SCREENER[this.currentDomainIndex]
    return nextDomain.questions[0]
  }

  private generateResponseMessage(
    userResponse: boolean,
    nextQuestion: any,
    isComplete: boolean,
    aiRecommendations?: string
  ): string {
    if (isComplete) {
      return `Assessment complete! Your responses have been recorded and analyzed. ${aiRecommendations ? 'Please review the recommendations below.' : ''}`
    }
    
    return `Thank you for your response. ${nextQuestion ? 'Next question ready.' : 'Moving to next section.'}`
  }

  private calculateProgress() {
    const totalQuestions = EARLY_DETECTION_SCREENER.reduce((sum, domain) => sum + domain.questions.length, 0)
    const answeredQuestions = this.questionResponses.length
    const completedDomains = this.currentDomainIndex
    
    return {
      totalQuestions,
      answeredQuestions,
      completedDomains,
      overallProgress: (answeredQuestions / totalQuestions) * 100
    }
  }

  private updateCurrentProgress() {
    // Update current indices based on responses
    let totalAnswered = 0
    for (let domainIndex = 0; domainIndex < EARLY_DETECTION_SCREENER.length; domainIndex++) {
      const domain = EARLY_DETECTION_SCREENER[domainIndex]
      const domainResponses = this.questionResponses.filter(r => 
        domain.questions.some(q => q.id === r.questionId)
      )
      
      if (domainResponses.length === domain.questions.length) {
        // Domain complete
        totalAnswered += domain.questions.length
        this.currentDomainIndex = domainIndex + 1
        this.currentQuestionIndex = 0
      } else if (domainResponses.length > 0) {
        // Domain in progress
        this.currentDomainIndex = domainIndex
        this.currentQuestionIndex = domainResponses.length - 1
        break
      }
    }
  }

  private async saveQuestionResponse(questionResponse: StructuredQuestionResponse) {
    try {
      await prisma.questionResponse.create({
        data: {
          assessmentId: this.assessmentId,
          questionId: questionResponse.questionId,
          response: questionResponse.response,
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('Error saving question response:', error)
    }
  }

  private async updateStructuredScores(domainScores: DomainScore[]): Promise<void> {
    try {
      const scoreUpdates = domainScores.map(domainScore => ({
        assessmentId: this.assessmentId,
        domain: domainScore.domain as AssessmentDomain,
        rawScore: domainScore.score,
        percentage: domainScore.percentage,
        riskLevel: ScoringCalculator.mapScoreToRiskLevel(domainScore),
        confidence: domainScore.isClinicallySignificant ? 0.9 : 0.7,
        timestamp: new Date()
      }))

      await prisma.score.createMany({
        data: scoreUpdates
      })
    } catch (error) {
      console.error('Error updating scores:', error)
    }
  }

  async getInitialStructuredQuestion(): Promise<{ questionId: string; text: string; domain: string } | null> {
    if (EARLY_DETECTION_SCREENER.length === 0) return null
    
    const firstDomain = EARLY_DETECTION_SCREENER[0]
    const firstQuestion = firstDomain.questions[0]
    
    return {
      questionId: firstQuestion.id,
      text: firstQuestion.text,
      domain: firstDomain.name
    }
  }

  async getCurrentScores(): Promise<AssessmentScores> {
    return this.currentScores
  }

  static async createNewAssessment(userId: string, subjectName: string): Promise<string> {
    try {
      const assessment = await prisma.assessment.create({
        data: {
          userId,
          subjectName,
          isStructured: true,
          status: 'IN_PROGRESS',
          currentDomain: EARLY_DETECTION_SCREENER[0]?.name as AssessmentDomain || AssessmentDomain.ANTISOCIAL
        }
      })

      return assessment.id
    } catch (error) {
      console.error('Error creating assessment:', error)
      throw new Error('Failed to create new assessment')
    }
  }
}

        // Calculate current scores from responses
        const domainScores = scoringCalculator.calculateOverallScores(this.questionResponses)
        domainScores.forEach(score => {
          this.currentScores[score.domain] = score.percentage
        })
      } else {
        // Load latest scores for conversational mode
        const latestScores = await prisma.score.findMany({
          where: { assessmentId: this.assessmentId },
          orderBy: { timestamp: 'desc' },
          distinct: ['domain']
        })

        latestScores.forEach(score => {
          this.currentScores[score.domain] = score.rawScore
        })
      }
    } catch (error) {
      console.error('Error initializing AssessmentAI:', error)
      throw new Error(ERROR_MESSAGES.ASSESSMENT.INITIALIZATION_FAILED)
    }
  }

  async processResponse(userResponse: string): Promise<AssessmentResponse> {
    if (this.isStructuredMode) {
      throw new Error('Use processStructuredResponse for structured assessments')
    }

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
      throw new Error(ERROR_MESSAGES.ASSESSMENT.PROCESSING_FAILED)
    }
  }

  async processStructuredResponse(questionResponse: StructuredQuestionResponse): Promise<AssessmentResponse> {
    if (!this.isStructuredMode) {
      throw new Error('Use processResponse for conversational assessments')
    }

    try {
      // Get current assessment state
      const assessment = await prisma.assessment.findUnique({
        where: { id: this.assessmentId }
      })

      if (!assessment) {
        throw new Error('Assessment not found')
      }

      // Validate the question and determine domain
      const currentDomain = assessment.currentDomain
      if (!currentDomain) {
        throw new Error('No current domain set for assessment')
      }

      // Validate question belongs to current domain
      if (!scoringCalculator.validateQuestionResponse(
        questionResponse.questionId,
        currentDomain,
        questionResponse.response
      )) {
        throw new Error('Invalid question response')
      }

      // Store the response
      await prisma.questionResponse.create({
        data: {
          assessmentId: this.assessmentId,
          questionId: questionResponse.questionId,
          response: questionResponse.response,
          timestamp: new Date()
        }
      })

      // Add to local responses
      this.questionResponses.push({
        questionId: questionResponse.questionId,
        response: questionResponse.response,
        domain: currentDomain,
        timestamp: new Date()
      })

      // Check for early termination
      const terminationCheck = scoringCalculator.checkEarlyTermination(currentDomain, this.questionResponses)

      let nextQuestionData = null
      let nextDomain = currentDomain
      let isComplete = false

      if (terminationCheck.shouldTerminate) {
        // Move to next domain
        const completedDomains = new Set([currentDomain])
        const allDomainResponses = this.questionResponses

        // Add other completed domains
        Object.values(AssessmentDomain).forEach(domain => {
          if (domain !== currentDomain) {
            const domainResponses = allDomainResponses.filter(r => r.domain === domain)
            const termination = scoringCalculator.checkEarlyTermination(domain, domainResponses)
            const nextQ = scoringCalculator.getNextQuestion(domain, domainResponses)

            if (termination.shouldTerminate || !nextQ) {
              completedDomains.add(domain)
            }
          }
        })

        nextDomain = scoringCalculator.getNextDomain(completedDomains) || currentDomain
        if (nextDomain !== currentDomain) {
          nextQuestionData = scoringCalculator.getNextQuestion(nextDomain, this.questionResponses)
        }
      } else {
        // Get next question in current domain
        nextQuestionData = scoringCalculator.getNextQuestion(currentDomain, this.questionResponses)

        if (!nextQuestionData) {
          // Domain complete, move to next
          const completedDomains = new Set([currentDomain])

          // Check other domains
          Object.values(AssessmentDomain).forEach(domain => {
            if (domain !== currentDomain) {
              const domainResponses = this.questionResponses.filter(r => r.domain === domain)
              const termination = scoringCalculator.checkEarlyTermination(domain, domainResponses)
              const nextQ = scoringCalculator.getNextQuestion(domain, domainResponses)

              if (termination.shouldTerminate || !nextQ) {
                completedDomains.add(domain)
              }
            }
          })

          nextDomain = scoringCalculator.getNextDomain(completedDomains) || currentDomain
          if (nextDomain !== currentDomain) {
            nextQuestionData = scoringCalculator.getNextQuestion(nextDomain, this.questionResponses)
          }
        }
      }

      // Check if assessment is complete
      isComplete = scoringCalculator.isAssessmentComplete(this.questionResponses)

      // Update assessment state
      await prisma.assessment.update({
        where: { id: this.assessmentId },
        data: {
          currentDomain: isComplete ? null : nextDomain,
          currentQuestionOrder: nextQuestionData?.order || null,
          ...(isComplete && {
            status: 'COMPLETED',
            completedAt: new Date()
          })
        }
      })

      // Calculate and update scores
      const domainScores = scoringCalculator.calculateOverallScores(this.questionResponses)
      await this.updateStructuredScores(domainScores)

      // Generate response message
      const responseMessage = this.generateStructuredResponseMessage(
        questionResponse.response,
        nextQuestionData,
        isComplete,
        terminationCheck.shouldTerminate ? terminationCheck.reason : undefined
      )

      // Store conversation messages
      const userMessage = questionResponse.response ? "Yes" : "No"
      const conversationMessages = [
        { role: MessageRole.USER, content: userMessage },
        { role: MessageRole.ASSISTANT, content: responseMessage }
      ]

      for (const msg of conversationMessages) {
        await prisma.chatMessage.create({
          data: {
            assessmentId: this.assessmentId,
            role: msg.role,
            content: msg.content,
            timestamp: new Date()
          }
        })
      }

      return {
        message: responseMessage,
        scores: domainScores.map(score => ({
          domain: score.domain,
          rawScore: score.rawScore,
          riskLevel: score.riskLevel,
          confidence: score.confidence
        })),
        nextQuestion: nextQuestionData?.text,
        questionId: nextQuestionData?.questionId,
        currentDomain: isComplete ? undefined : nextDomain,
        isComplete,
        progress: scoringCalculator.getProgressSummary(this.questionResponses)
      }
    } catch (error) {
      console.error('Error processing structured response:', error)
      throw new Error(ERROR_MESSAGES.ASSESSMENT.PROCESSING_FAILED)
    }
  }

  private async analyzeResponse(response: string): Promise<{
    scores: ScoreUpdate[]
    isComplete: boolean
  }> {
    const systemPrompt = SYSTEM_PROMPTS.ASSESSMENT_ANALYSIS

    try {
      const completion = await generateChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Conversation history: ${JSON.stringify(this.conversationHistory.slice(-6))}\n\nCurrent response to analyze: "${response}"` }
      ], {
        model: AI_MODELS.CHAT.PRIMARY,
        temperature: AI_PARAMETERS.ASSESSMENT.TEMPERATURE,
        maxTokens: AI_PARAMETERS.ASSESSMENT.MAX_TOKENS
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error(ERROR_MESSAGES.AI.NO_RESPONSE)
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
          confidence: AI_PARAMETERS.ASSESSMENT.SCORE_CONFIDENCE_THRESHOLD
        })),
        isComplete: false
      }
    }
  }

  private async generateNextQuestion(): Promise<string | null> {
    if (this.conversationHistory.length >= AI_PARAMETERS.ASSESSMENT.MAX_CONVERSATION_LENGTH) {
      return null // Assessment should be complete
    }

    const systemPrompt = SYSTEM_PROMPTS.ASSESSMENT_QUESTIONS

    try {
      const completion = await generateChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Conversation so far: ${JSON.stringify(this.conversationHistory)}\n\nCurrent scores: ${JSON.stringify(this.currentScores)}` }
      ], {
        model: AI_MODELS.CHAT.PRIMARY,
        temperature: AI_PARAMETERS.QUESTION_GENERATION.TEMPERATURE,
        maxTokens: AI_PARAMETERS.QUESTION_GENERATION.MAX_TOKENS
      })

      return completion.choices[0]?.message?.content || null
    } catch (error) {
      console.error('Error generating next question:', error)
      return SYSTEM_PROMPTS.FALLBACKS.ASSESSMENT_QUESTION
    }
  }

  private generateCompletionMessage(): string {
    const totalResponses = this.conversationHistory.filter(msg => msg.role === MessageRole.USER).length
    return SUCCESS_MESSAGES.ASSESSMENT.COMPLETION(totalResponses)
  }

  private async updateScores(scores: ScoreUpdate[]): Promise<void> {
    try {
      const scorePromises = scores.map(score =>
        prisma.score.create({
          data: {
            assessmentId: this.assessmentId,
            domain: score.domain,
            rawScore: score.rawScore,
            totalPossible: 100, // For conversational mode, always 100
            questionsAnswered: this.conversationHistory.filter(m => m.role === MessageRole.USER).length,
            riskLevel: score.riskLevel,
            confidence: score.confidence,
            wasTerminatedEarly: false,
            timestamp: new Date()
          }
        })
      )

      await Promise.all(scorePromises)
    } catch (error) {
      console.error('Error updating scores:', error)
      throw new Error(ERROR_MESSAGES.ASSESSMENT.SCORE_UPDATE_FAILED)
    }
  }

  private async updateStructuredScores(domainScores: DomainScore[]): Promise<void> {
    try {
      const scorePromises = domainScores.map(score =>
        prisma.score.create({
          data: {
            assessmentId: this.assessmentId,
            domain: score.domain,
            rawScore: score.rawScore,
            totalPossible: score.totalPossible,
            questionsAnswered: score.questionsAnswered,
            riskLevel: score.riskLevel,
            confidence: score.confidence,
            wasTerminatedEarly: score.wasTerminatedEarly,
            timestamp: new Date()
          }
        })
      )

      await Promise.all(scorePromises)
    } catch (error) {
      console.error('Error updating structured scores:', error)
      throw new Error(ERROR_MESSAGES.ASSESSMENT.SCORE_UPDATE_FAILED)
    }
  }

  private generateStructuredResponseMessage(
    userResponse: boolean,
    nextQuestion: { questionId: string; text: string; order: number } | null,
    isComplete: boolean,
    terminationReason?: string
  ): string {
    if (isComplete) {
      return this.generateCompletionMessage()
    }

    if (terminationReason) {
      return nextQuestion
        ? `Thank you for your response. Moving to the next section.\n\n${nextQuestion.text}`
        : 'Thank you for your responses. The assessment is now complete.'
    }

    return nextQuestion
      ? nextQuestion.text
      : 'Thank you for completing this section.'
  }

  async getInitialStructuredQuestion(): Promise<{ questionId: string; text: string; domain: AssessmentDomain } | null> {
    if (!this.isStructuredMode) {
      return null
    }

    try {
      // Get the first domain and first question
      const firstDomain = scoringCalculator.getNextDomain(new Set())
      if (!firstDomain) {
        return null
      }

      const firstQuestion = scoringCalculator.getNextQuestion(firstDomain, [])
      if (!firstQuestion) {
        return null
      }

      // Update assessment with initial state
      await prisma.assessment.update({
        where: { id: this.assessmentId },
        data: {
          currentDomain: firstDomain,
          currentQuestionOrder: firstQuestion.order
        }
      })

      return {
        questionId: firstQuestion.questionId,
        text: firstQuestion.text,
        domain: firstDomain
      }
    } catch (error) {
      console.error('Error getting initial question:', error)
      return null
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
      throw new Error(ERROR_MESSAGES.ASSESSMENT.CREATION_FAILED)
    }
  }
}