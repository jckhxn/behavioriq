"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AssessmentDomain, RiskLevel } from '@prisma/client'
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Score {
  domain: AssessmentDomain
  rawScore: number
  riskLevel: RiskLevel
  confidence: number
  timestamp: Date
}

interface ScoringSidebarProps {
  assessmentId: string
}

const DOMAIN_LABELS = {
  [AssessmentDomain.ANTISOCIAL]: 'Antisocial',
  [AssessmentDomain.VIOLENCE]: 'Violence',
  [AssessmentDomain.ATTENTION]: 'Attention',
  [AssessmentDomain.EMOTIONAL]: 'Emotional',
  [AssessmentDomain.CONDUCT]: 'Conduct'
}

const RISK_COLORS = {
  [RiskLevel.LOW]: 'bg-green-500',
  [RiskLevel.MODERATE]: 'bg-yellow-500',
  [RiskLevel.HIGH]: 'bg-orange-500',
  [RiskLevel.VERY_HIGH]: 'bg-red-500'
}

const RISK_VARIANTS = {
  [RiskLevel.LOW]: 'secondary' as const,
  [RiskLevel.MODERATE]: 'secondary' as const,
  [RiskLevel.HIGH]: 'destructive' as const,
  [RiskLevel.VERY_HIGH]: 'destructive' as const
}

export function ScoringSidebar({ assessmentId }: ScoringSidebarProps) {
  const [scores, setScores] = useState<Score[]>([])
  const [assessmentStatus, setAssessmentStatus] = useState<'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS')
  const [isLoading, setIsLoading] = useState(true)
  const [messageCount, setMessageCount] = useState(0)

  // Load scores and poll for updates
  useEffect(() => {
    const loadScores = async () => {
      try {
        const response = await fetch(`/api/assessments/${assessmentId}/scores`)
        if (response.ok) {
          const data = await response.json()
          setScores(data.scores.map((score: any) => ({
            ...score,
            timestamp: new Date(score.timestamp)
          })))
          setAssessmentStatus(data.status)
          setMessageCount(data.messageCount)
        }
      } catch (error) {
        console.error('Error loading scores:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadScores()

    // Poll for updates every 5 seconds if assessment is in progress
    const interval = setInterval(() => {
      if (assessmentStatus === 'IN_PROGRESS') {
        loadScores()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [assessmentId, assessmentStatus])

  // Get latest score for each domain
  const getLatestScores = () => {
    const latestScores: Record<AssessmentDomain, Score | null> = {
      [AssessmentDomain.ANTISOCIAL]: null,
      [AssessmentDomain.VIOLENCE]: null,
      [AssessmentDomain.ATTENTION]: null,
      [AssessmentDomain.EMOTIONAL]: null,
      [AssessmentDomain.CONDUCT]: null
    }

    scores.forEach(score => {
      if (!latestScores[score.domain] || 
          score.timestamp > latestScores[score.domain]!.timestamp) {
        latestScores[score.domain] = score
      }
    })

    return latestScores
  }

  const calculateOverallRisk = (latestScores: Record<AssessmentDomain, Score | null>): RiskLevel => {
    const validScores = Object.values(latestScores).filter(score => score !== null)
    if (validScores.length === 0) return RiskLevel.LOW

    const riskValues = {
      [RiskLevel.LOW]: 1,
      [RiskLevel.MODERATE]: 2,
      [RiskLevel.HIGH]: 3,
      [RiskLevel.VERY_HIGH]: 4
    }

    const avgRisk = validScores.reduce((sum, score) => sum + riskValues[score!.riskLevel], 0) / validScores.length

    if (avgRisk < 1.5) return RiskLevel.LOW
    if (avgRisk < 2.5) return RiskLevel.MODERATE
    if (avgRisk < 3.5) return RiskLevel.HIGH
    return RiskLevel.VERY_HIGH
  }

  const getStatusIcon = (status: 'IN_PROGRESS' | 'COMPLETED') => {
    if (status === 'COMPLETED') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <Clock className="h-4 w-4 text-blue-500" />
  }

  const getRiskIcon = (riskLevel: RiskLevel) => {
    if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.VERY_HIGH) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Assessment Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Clock className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const latestScores = getLatestScores()
  const overallRisk = calculateOverallRisk(latestScores)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Assessment Scores
          {getStatusIcon(assessmentStatus)}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {messageCount} exchanges • {assessmentStatus.replace('_', ' ').toLowerCase()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Risk */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Risk</span>
            {getRiskIcon(overallRisk)}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${RISK_COLORS[overallRisk]}`} />
            <Badge variant={RISK_VARIANTS[overallRisk]}>
              {overallRisk.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Domain Scores */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {Object.entries(DOMAIN_LABELS).map(([domain, label]) => {
              const score = latestScores[domain as AssessmentDomain]
              
              return (
                <div key={domain} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    {score && getRiskIcon(score.riskLevel)}
                  </div>
                  
                  {score ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Score: {Math.round(score.rawScore)}/100</span>
                          <span>Confidence: {Math.round(score.confidence * 100)}%</span>
                        </div>
                        <Progress value={score.rawScore} className="h-2" />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${RISK_COLORS[score.riskLevel]}`} />
                        <Badge variant={RISK_VARIANTS[score.riskLevel]} className="text-xs">
                          {score.riskLevel.replace('_', ' ')}
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      No data yet
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Score History */}
        {scores.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="text-sm font-medium">Recent Updates</span>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {scores
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .slice(0, 5)
                    .map((score, index) => (
                      <div key={index} className="text-xs p-2 bg-muted rounded">
                        <div className="flex justify-between">
                          <span>{DOMAIN_LABELS[score.domain]}</span>
                          <span>{Math.round(score.rawScore)}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {score.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Assessment Progress */}
        {assessmentStatus === 'IN_PROGRESS' && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="text-sm font-medium">Progress</span>
              <div className="text-xs text-muted-foreground">
                Continue the conversation to gather more assessment data.
                Typically {Math.max(0, 8 - messageCount)} more exchanges needed.
              </div>
            </div>
          </>
        )}

        {assessmentStatus === 'COMPLETED' && (
          <>
            <Separator />
            <div className="space-y-2 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
              <span className="text-sm font-medium">Assessment Complete</span>
              <div className="text-xs text-muted-foreground">
                All domains have been evaluated based on the conversation.
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}