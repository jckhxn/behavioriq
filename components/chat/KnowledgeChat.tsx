"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Loader2, FileText, Upload } from 'lucide-react'
import { DocumentUpload } from '@/components/documents/DocumentUpload'
import { DocumentCategory } from '@prisma/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    id: string
    title: string
    documentTitle: string
    fileName: string
    similarity: number
  }>
}

interface KnowledgeChatProps {
  sessionId: string
}

export function KnowledgeChat({ sessionId }: KnowledgeChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all')
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Load existing messages and suggestions
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load messages
        const messagesResponse = await fetch(`/api/knowledge/sessions/${sessionId}/messages`)
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          setMessages(messagesData.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })))
        }

        // Load suggested questions
        const suggestionsResponse = await fetch(`/api/knowledge/suggestions`)
        if (suggestionsResponse.ok) {
          const suggestionsData = await suggestionsResponse.json()
          setSuggestedQuestions(suggestionsData.suggestions)
        }
      } catch (error) {
        console.error('Error loading knowledge chat data:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    if (sessionId) {
      loadData()
    }
  }, [sessionId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/knowledge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message,
          categories: selectedCategory === 'all' ? undefined : [selectedCategory]
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          sources: data.sources
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I apologize, but I encountered an error while searching for information. Please try again.",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, there was a connection error. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading knowledge chat...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Knowledge Chat</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as DocumentCategory | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="POLICY">Policy</SelectItem>
              <SelectItem value="PROCEDURE">Procedure</SelectItem>
              <SelectItem value="GUIDELINE">Guideline</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
              <SelectItem value="ASSESSMENT_TOOL">Assessment Tool</SelectItem>
              <SelectItem value="REFERENCE">Reference</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpload(!showUpload)}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <div className="p-4 border-b bg-muted/50">
          <DocumentUpload onUploadComplete={() => setShowUpload(false)} />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Start a Knowledge Chat</h3>
              <p className="text-muted-foreground mb-4">
                Ask questions about your uploaded documents and I'll help you find answers.
              </p>
              
              {/* Suggested Questions */}
              {suggestedQuestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(question)}
                        className="text-xs"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                    <p className="text-xs font-medium mb-2">Sources:</p>
                    <div className="space-y-1">
                      {message.sources.map((source) => (
                        <div key={source.id} className="flex items-center justify-between text-xs">
                          <span className="truncate">{source.documentTitle}</span>
                          <Badge variant="secondary" className="ml-2">
                            {Math.round(source.similarity * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}