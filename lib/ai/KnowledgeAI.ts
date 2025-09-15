import { prisma } from '@/lib/db/prisma'
import { generateChatCompletion } from './openai'
import { searchSimilarDocuments, SearchResult } from '@/lib/documents/embeddings'
import { MessageRole, DocumentCategory } from '@prisma/client'

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
        take: 20 // Limit to recent messages to manage context
      })

      this.context.conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    } catch (error) {
      console.error('Error initializing KnowledgeAI:', error)
      throw new Error('Failed to initialize knowledge chat')
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
          limit: 5,
          threshold: 0.6,
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
      throw new Error('Failed to process query')
    }
  }

  private async generateContextualResponse(
    query: string,
    searchResults: SearchResult[]
  ): Promise<{ message: string; confidence: number }> {
    const hasRelevantContext = searchResults.length > 0 && searchResults[0].similarity > 0.7

    if (!hasRelevantContext) {
      return {
        message: "I don't have enough relevant information in the knowledge base to answer your question accurately. Could you try rephrasing your question or asking about a different topic?",
        confidence: 0.1
      }
    }

    // Prepare context from search results
    const contextChunks = searchResults
      .filter(result => result.similarity > 0.6)
      .map(result => `Source: ${result.document.title}\n${result.content}`)
      .join('\n\n---\n\n')

    const conversationContext = this.context.conversationHistory
      .slice(-6) // Last 3 exchanges
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    const systemPrompt = `You are a knowledgeable AI assistant helping users find information from their document collection.

Guidelines:
- Provide accurate, helpful answers based solely on the provided context
- Be concise but comprehensive
- If information is incomplete, acknowledge limitations
- Always cite which documents you're referencing
- Maintain conversational tone while being informative
- If the context doesn't contain relevant information, say so clearly

Context from documents:
${contextChunks}

Recent conversation:
${conversationContext}

Provide a helpful response that answers the user's question using the available context.`

    try {
      const completion = await generateChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ], {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 1000
      })

      const responseContent = completion.choices[0]?.message?.content || 
        "I'm sorry, I couldn't generate a response. Please try again."

      // Calculate confidence based on search result quality
      const avgSimilarity = searchResults.reduce((sum, result) => sum + result.similarity, 0) / searchResults.length
      const confidence = Math.min(avgSimilarity * 1.2, 0.95) // Boost slightly but cap at 95%

      return {
        message: responseContent,
        confidence
      }
    } catch (error) {
      console.error('Error generating contextual response:', error)
      return {
        message: "I encountered an error while processing your question. Please try again.",
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
      throw new Error('Failed to search documents')
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
      throw new Error('Failed to create chat session')
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
      throw new Error('Failed to update session title')
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
      
      const suggestions = [
        "What are the key policies I should be aware of?",
        "Can you summarize the main procedures?",
        "What assessment tools are available?",
        "Help me understand the guidelines for...",
      ]

      // Add category-specific suggestions
      if (categories.includes(DocumentCategory.POLICY)) {
        suggestions.push("What's our policy on...")
      }
      if (categories.includes(DocumentCategory.PROCEDURE)) {
        suggestions.push("How do I follow the procedure for...")
      }
      if (categories.includes(DocumentCategory.ASSESSMENT_TOOL)) {
        suggestions.push("Which assessment tool should I use for...")
      }

      return suggestions.slice(0, 5)
    } catch (error) {
      console.error('Error getting suggested questions:', error)
      return [
        "What information do you have about...?",
        "Can you help me understand...?",
        "What should I know about...?"
      ]
    }
  }
}