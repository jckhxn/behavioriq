import { prisma } from '@/lib/db/prisma'
import { generateChatCompletion } from './openai'
import { searchSimilarDocuments, SearchResult } from '@/lib/documents/embeddings'
import { MessageRole, DocumentCategory } from '@prisma/client'
import {
  AI_MODELS,
  AI_PARAMETERS,
  KNOWLEDGE_CONFIG,
  SYSTEM_PROMPTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  getCategorySuggestions
} from '@/lib/config/ai-config'

export interface KnowledgeResponse {
  message: string
  sources: SearchResult[]
  confidence: number
}

export interface ChatContext {
  sessionId: string
  userId: string
  conversationHistory: Array<{ role: MessageRole; content: string }>
}

export class KnowledgeAI {
  private context: ChatContext

  constructor(sessionId: string, userId: string) {
    this.context = {
      sessionId,
      userId,
      conversationHistory: []
    }
  }

  async initialize(): Promise<void> {
    try {
      // Load existing conversation history
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId: this.context.sessionId },
        orderBy: { timestamp: 'asc' },
        take: AI_PARAMETERS.KNOWLEDGE.CONTEXT_WINDOW
      })

      this.context.conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    } catch (error) {
      console.error('Error initializing KnowledgeAI:', error)
      throw new Error(ERROR_MESSAGES.KNOWLEDGE.INITIALIZATION_FAILED)
    }
  }

  async processQuery(query: string, categories?: DocumentCategory[]): Promise<KnowledgeResponse> {
    try {
      // Add user query to history
      this.context.conversationHistory.push({
        role: MessageRole.USER,
        content: query
      })

      // Search for relevant documents
      const searchResults = await searchSimilarDocuments(
        query,
        this.context.userId,
        {
          limit: AI_PARAMETERS.KNOWLEDGE.SEARCH_LIMIT,
          threshold: AI_PARAMETERS.KNOWLEDGE.SEARCH_THRESHOLD,
          categories
        }
      )

      // Generate response using retrieved context
      const response = await this.generateContextualResponse(query, searchResults)

      // Add assistant response to history
      this.context.conversationHistory.push({
        role: MessageRole.ASSISTANT,
        content: response.message
      })

      // Store both messages in database
      await this.storeMessages(query, response.message, searchResults)

      return response
    } catch (error) {
      console.error('Error processing knowledge query:', error)
      throw new Error(ERROR_MESSAGES.KNOWLEDGE.PROCESSING_FAILED)
    }
  }

  private async generateContextualResponse(
    query: string,
    searchResults: SearchResult[]
  ): Promise<{ message: string; confidence: number }> {
    const hasRelevantContext = searchResults.length > 0 && searchResults[0].similarity > AI_PARAMETERS.KNOWLEDGE.HIGH_SIMILARITY_THRESHOLD

    if (!hasRelevantContext) {
      return {
        message: SYSTEM_PROMPTS.FALLBACKS.KNOWLEDGE_NO_CONTEXT,
        confidence: 0.1
      }
    }

    // Prepare context from search results
    const contextChunks = searchResults
      .filter(result => result.similarity > AI_PARAMETERS.KNOWLEDGE.MIN_SIMILARITY_FOR_CONTEXT)
      .map(result => `Source: ${result.document.title}\n${result.content}`)
      .join('\n\n---\n\n')

    const conversationContext = this.context.conversationHistory
      .slice(-AI_PARAMETERS.KNOWLEDGE.CONVERSATION_CONTEXT_LIMIT)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    const systemPrompt = `${SYSTEM_PROMPTS.KNOWLEDGE_RESPONSE}

Context from documents:
${contextChunks}

Recent conversation:
${conversationContext}`

    try {
      const completion = await generateChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ], {
        model: AI_MODELS.CHAT.PRIMARY,
        temperature: AI_PARAMETERS.KNOWLEDGE.TEMPERATURE,
        maxTokens: AI_PARAMETERS.KNOWLEDGE.MAX_TOKENS
      })

      const responseContent = completion.choices[0]?.message?.content ||
        SYSTEM_PROMPTS.FALLBACKS.KNOWLEDGE_ERROR

      // Calculate confidence based on search result quality
      const avgSimilarity = searchResults.reduce((sum, result) => sum + result.similarity, 0) / searchResults.length
      const confidence = Math.min(avgSimilarity * AI_PARAMETERS.KNOWLEDGE.CONFIDENCE_BOOST_FACTOR, AI_PARAMETERS.KNOWLEDGE.MAX_CONFIDENCE)

      return {
        message: responseContent,
        confidence
      }
    } catch (error) {
      console.error('Error generating contextual response:', error)
      return {
        message: SYSTEM_PROMPTS.FALLBACKS.KNOWLEDGE_ERROR,
        confidence: 0.1
      }
    }
  }

  private async storeMessages(
    userQuery: string,
    assistantResponse: string,
    sources: SearchResult[]
  ): Promise<void> {
    try {
      // Prepare sources for storage
      const sourcesData = sources.map(source => ({
        id: source.id,
        title: source.title,
        documentTitle: source.document.title,
        fileName: source.document.fileName,
        similarity: source.similarity
      }))

      // Store user message
      await prisma.chatMessage.create({
        data: {
          sessionId: this.context.sessionId,
          role: MessageRole.USER,
          content: userQuery,
          timestamp: new Date()
        }
      })

      // Store assistant message with sources
      await prisma.chatMessage.create({
        data: {
          sessionId: this.context.sessionId,
          role: MessageRole.ASSISTANT,
          content: assistantResponse,
          sources: sourcesData,
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('Error storing messages:', error)
      // Don't throw here as the response was successful
    }
  }

  async searchDocuments(
    query: string,
    options: {
      categories?: DocumentCategory[]
      limit?: number
    } = {}
  ): Promise<SearchResult[]> {
    try {
      return await searchSimilarDocuments(query, this.context.userId, {
        limit: options.limit || 10,
        threshold: 0.5,
        categories: options.categories
      })
    } catch (error) {
      console.error('Error searching documents:', error)
      throw new Error(ERROR_MESSAGES.KNOWLEDGE.SEARCH_FAILED)
    }
  }

  static async createNewSession(userId: string, title: string = 'Knowledge Chat'): Promise<string> {
    try {
      const session = await prisma.chatSession.create({
        data: {
          userId,
          title,
          type: 'KNOWLEDGE'
        }
      })

      return session.id
    } catch (error) {
      console.error('Error creating new knowledge session:', error)
      throw new Error(ERROR_MESSAGES.KNOWLEDGE.SESSION_CREATION_FAILED)
    }
  }

  static async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    try {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title }
      })
    } catch (error) {
      console.error('Error updating session title:', error)
      throw new Error(ERROR_MESSAGES.KNOWLEDGE.SESSION_UPDATE_FAILED)
    }
  }

  async getSuggestedQuestions(): Promise<string[]> {
    try {
      // Get recent document categories for suggestions
      const recentDocs = await prisma.document.findMany({
        where: { userId: this.context.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { title: true, category: true }
      })

      const categories = [...new Set(recentDocs.map(doc => doc.category))]
      
      return getCategorySuggestions(categories)
    } catch (error) {
      console.error('Error getting suggested questions:', error)
      return KNOWLEDGE_CONFIG.DEFAULT_SUGGESTIONS.slice(0, 3)
    }
  }
}