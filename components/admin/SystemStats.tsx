"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart3, Users, FileText, Brain, MessageSquare } from 'lucide-react'

interface SystemStats {
  users: {
    total: number
    admins: number
    activeThisMonth: number
  }
  documents: {
    total: number
    totalSize: number
    categories: Record<string, number>
  }
  assessments: {
    total: number
    completed: number
    inProgress: number
    averageCompletion: number
  }
  chatSessions: {
    total: number
    knowledge: number
    averageMessagesPerSession: number
  }
  storage: {
    used: number
    limit: number
  }
}

export function SystemStats() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-4" />
        <p>Loading system statistics...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load system statistics.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.admins} admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents.total}</div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(stats.documents.totalSize)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assessments.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.assessments.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.chatSessions.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.chatSessions.knowledge} knowledge chats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
            <CardDescription>Document storage consumption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span>{formatFileSize(stats.storage.used)} / {formatFileSize(stats.storage.limit)}</span>
              </div>
              <Progress value={(stats.storage.used / stats.storage.limit) * 100} />
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((stats.storage.used / stats.storage.limit) * 100)}% of available storage used
            </div>
          </CardContent>
        </Card>

        {/* Assessment Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Status</CardTitle>
            <CardDescription>Assessment completion statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <span className="text-sm font-medium">{stats.assessments.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <span className="text-sm font-medium">{stats.assessments.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completion Rate</span>
                <span className="text-sm font-medium">
                  {Math.round(stats.assessments.averageCompletion)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Document Categories</CardTitle>
            <CardDescription>Distribution of documents by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.documents.categories).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{category.toLowerCase().replace('_', ' ')}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>User engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active This Month</span>
                <span className="text-sm font-medium">{stats.users.activeThisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Messages/Session</span>
                <span className="text-sm font-medium">
                  {stats.chatSessions.averageMessagesPerSession.toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}