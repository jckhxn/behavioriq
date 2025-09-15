"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { AssessmentChat } from './AssessmentChat'
import { KnowledgeChat } from './KnowledgeChat'
import { ScoringSidebar } from '@/components/scoring/ScoringSidebar'
import { useSession } from 'next-auth/react'
import { Brain, FileText } from 'lucide-react'

interface UnifiedChatProps {
  defaultTab?: 'assessment' | 'knowledge'
}

export function UnifiedChat({ defaultTab = 'assessment' }: UnifiedChatProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize sessions when tab changes
  useEffect(() => {
    if (!session?.user) return

    const initializeSessions = async () => {
      setIsLoading(true)
      try {
        if (activeTab === 'assessment' && !assessmentId) {
          // Create new assessment
          const response = await fetch('/api/assessments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subjectName: `Assessment ${new Date().toLocaleDateString()}`
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            setAssessmentId(data.assessmentId)
          }
        } else if (activeTab === 'knowledge' && !sessionId) {
          // Create new knowledge session
          const response = await fetch('/api/knowledge/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Chat ${new Date().toLocaleDateString()}`
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            setSessionId(data.sessionId)
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSessions()
  }, [activeTab, session?.user, assessmentId, sessionId])

  if (!session?.user) {
    return (
      <Card className="p-8 text-center">
        <p>Please log in to access the chat features.</p>
      </Card>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Main Chat Area */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'assessment' | 'knowledge')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Assessment
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Knowledge
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="assessment" className="mt-4">
            <Card className="h-[calc(100vh-8rem)]">
              {assessmentId ? (
                <AssessmentChat assessmentId={assessmentId} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Initializing assessment...</p>
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="knowledge" className="mt-4">
            <Card className="h-[calc(100vh-8rem)]">
              {sessionId ? (
                <KnowledgeChat sessionId={sessionId} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Initializing knowledge chat...</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Scoring Sidebar - Only show for assessment */}
      {activeTab === 'assessment' && assessmentId && (
        <div className="w-80">
          <ScoringSidebar assessmentId={assessmentId} />
        </div>
      )}
    </div>
  )
}