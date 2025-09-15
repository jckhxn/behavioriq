"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AssessmentChatProps {
  assessmentId: string
}

export function AssessmentChat({ assessmentId }: AssessmentChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [assessmentStatus, setAssessmentStatus] = useState<'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Load existing messages and send initial greeting
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/assessments/${assessmentId}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })))
          setAssessmentStatus(data.status)
          
          // Send initial greeting if no messages exist
          if (data.messages.length === 0) {
            await sendInitialGreeting()
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    if (assessmentId) {
      loadMessages()
    }
  }, [assessmentId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendInitialGreeting = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'start_assessment'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Error sending initial greeting:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading || assessmentStatus === 'COMPLETED') return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
        
        if (data.isComplete) {
          setAssessmentStatus('COMPLETED')
        }
      } else {
        // Handle error
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I apologize, but I encountered an error. Please try again.",
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

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading assessment...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Behavioral Assessment</h2>
        <Badge variant={assessmentStatus === 'COMPLETED' ? 'secondary' : 'default'}>
          {assessmentStatus === 'COMPLETED' ? 'Complete' : 'In Progress'}
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
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
                <p className="text-sm">{message.content}</p>
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
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              assessmentStatus === 'COMPLETED'
                ? "Assessment completed"
                : "Share your thoughts and feelings..."
            }
            disabled={isLoading || assessmentStatus === 'COMPLETED'}
            className="min-h-[60px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || assessmentStatus === 'COMPLETED'}
            size="sm"
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {assessmentStatus === 'COMPLETED' && (
          <p className="text-sm text-muted-foreground mt-2">
            Assessment completed. Check the scoring panel for results.
          </p>
        )}
      </form>
    </div>
  )
}