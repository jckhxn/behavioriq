"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Send, Loader2, FileText, Upload, MessageSquare, Filter, X, ChevronDown, ExternalLink } from 'lucide-react'
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
    <div className="flex flex-col h-full bg-background">
      {/* Enhanced Header */}
      <CardHeader className="p-4 border-b bg-gradient-to-r from-background to-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Knowledge Chat</CardTitle>
              <p className="text-sm text-muted-foreground">Ask questions about your documents</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as DocumentCategory | 'all')}>
              <SelectTrigger className="w-[180px] bg-background border-2">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="POLICY">📋 Policy</SelectItem>
                <SelectItem value="PROCEDURE">⚙️ Procedure</SelectItem>
                <SelectItem value="GUIDELINE">📝 Guideline</SelectItem>
                <SelectItem value="MANUAL">📖 Manual</SelectItem>
                <SelectItem value="ASSESSMENT_TOOL">🧮 Assessment Tool</SelectItem>
                <SelectItem value="REFERENCE">🔗 Reference</SelectItem>
                <SelectItem value="OTHER">📄 Other</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showUpload ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUpload(!showUpload)}
              className="gap-2"
            >
              {showUpload ? <X className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              {showUpload ? "Close" : "Upload"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Enhanced Upload Area */}
      {showUpload && (
        <div className="p-4 border-b bg-gradient-to-r from-muted/50 to-muted/20">
          <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="p-4">
              <DocumentUpload onUploadComplete={() => setShowUpload(false)} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto space-y-6">
                <div className="p-4 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 w-fit mx-auto">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Welcome to Knowledge Chat</h3>
                  <p className="text-muted-foreground">
                    Upload documents and ask questions to get instant, accurate answers backed by your content.
                  </p>
                </div>

                {/* Enhanced Suggested Questions */}
                {suggestedQuestions.length > 0 && (
                  <Card className="p-4 bg-gradient-to-r from-muted/50 to-background">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Try asking:
                    </h4>
                    <div className="grid gap-2">
                      {suggestedQuestions.slice(0, 3).map((question, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSuggestionClick(question)}
                          className="justify-start text-left h-auto p-3 text-sm font-normal hover:bg-primary/5"
                        >
                          <ChevronDown className="h-3 w-3 mr-2 rotate-[-90deg]" />
                          {question}
                        </Button>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground'
                    : 'bg-gradient-to-r from-background to-muted/50 border border-border'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {/* Enhanced Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-muted-foreground/10">
                    <div className="flex items-center gap-2 mb-3">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">
                        Sources ({message.sources.length})
                      </p>
                    </div>
                    <div className="space-y-2">
                      {message.sources.map((source) => (
                        <Card key={source.id} className="p-3 bg-background/50 border border-muted/50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{source.documentTitle}</p>
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {source.fileName}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs shrink-0 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                            >
                              {Math.round(source.similarity * 100)}% match
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <p className={`text-xs mt-3 flex items-center gap-1 ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-muted to-muted/50 rounded-2xl p-4 shadow-sm border border-border">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Searching through your documents...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Enhanced Input Form */}
      <div className="p-4 border-t bg-gradient-to-r from-background to-muted/20">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your documents..."
                disabled={isLoading}
                className="pr-12 h-12 bg-background border-2 rounded-xl focus:ring-2 focus:ring-primary/20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {input.trim() && (
                  <Badge variant="secondary" className="text-xs">
                    {input.length}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="lg"
              className="h-12 px-6 rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Ask</span>
                </>
              )}
            </Button>
          </div>
          {selectedCategory !== 'all' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="h-3 w-3" />
              <span>Filtering by: {selectedCategory}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="h-auto p-0 text-xs hover:text-primary"
              >
                Clear filter
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}