"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentUpload } from '@/components/documents/DocumentUpload'
import { Search, Download, Trash2, Eye, Upload, Filter } from 'lucide-react'
import { DocumentCategory } from '@prisma/client'
import { toast } from 'sonner'

interface Document {
  id: string
  title: string
  fileName: string
  fileType: string
  fileSize: number
  category: DocumentCategory
  createdAt: string
  uploadedBy: {
    name: string
    email: string
  }
  _count: {
    chunks: number
  }
}

const CATEGORY_LABELS = {
  [DocumentCategory.POLICY]: 'Policy',
  [DocumentCategory.PROCEDURE]: 'Procedure',
  [DocumentCategory.GUIDELINE]: 'Guideline',
  [DocumentCategory.MANUAL]: 'Manual',
  [DocumentCategory.ASSESSMENT_TOOL]: 'Assessment Tool',
  [DocumentCategory.REFERENCE]: 'Reference',
  [DocumentCategory.OTHER]: 'Other'
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all')
  const [showUpload, setShowUpload] = useState(false)

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/admin/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      } else {
        toast.error('Failed to load documents')
      }
    } catch (error) {
      toast.error('Error loading documents')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Document deleted successfully')
        loadDocuments()
      } else {
        toast.error('Failed to delete document')
      }
    } catch (error) {
      toast.error('Error deleting document')
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Manage system documents and knowledge base content
              </CardDescription>
            </div>
            <Button onClick={() => setShowUpload(!showUpload)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        </CardHeader>

        {showUpload && (
          <CardContent>
            <DocumentUpload 
              onUploadComplete={() => {
                setShowUpload(false)
                loadDocuments()
              }}
              allowMultiple={true}
            />
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as DocumentCategory | 'all')}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents found matching your criteria.
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{document.title}</h3>
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[document.category]}
                        </Badge>
                        <Badge variant="outline">
                          {document.fileType.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>File: {document.fileName}</p>
                        <p>Size: {formatFileSize(document.fileSize)}</p>
                        <p>Chunks: {document._count.chunks}</p>
                        <p>Uploaded by: {document.uploadedBy.name || document.uploadedBy.email}</p>
                        <p>Date: {new Date(document.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(document.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}