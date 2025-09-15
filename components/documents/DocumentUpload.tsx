"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { DocumentCategory } from '@prisma/client'
import { toast } from 'sonner'

interface DocumentUploadProps {
  onUploadComplete?: (documents: any[]) => void
  allowMultiple?: boolean
  maxFileSize?: number // in MB
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  category: DocumentCategory
}

const SUPPORTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain'
]

const CATEGORY_LABELS = {
  [DocumentCategory.POLICY]: 'Policy',
  [DocumentCategory.PROCEDURE]: 'Procedure',
  [DocumentCategory.GUIDELINE]: 'Guideline',
  [DocumentCategory.MANUAL]: 'Manual',
  [DocumentCategory.ASSESSMENT_TOOL]: 'Assessment Tool',
  [DocumentCategory.REFERENCE]: 'Reference',
  [DocumentCategory.OTHER]: 'Other'
}

export function DocumentUpload({ 
  onUploadComplete, 
  allowMultiple = true,
  maxFileSize = 10 
}: DocumentUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(rejection => {
      const errors = rejection.errors.map((error: any) => error.message).join(', ')
      toast.error(`${rejection.file.name}: ${errors}`)
    })

    // Add accepted files
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending',
      category: DocumentCategory.OTHER
    }))

    setUploadFiles(prev => allowMultiple ? [...prev, ...newFiles] : newFiles)
  }, [allowMultiple])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    maxSize: maxFileSize * 1024 * 1024,
    multiple: allowMultiple
  })

  const updateFileCategory = (fileId: string, category: DocumentCategory) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, category } : file
    ))
  }

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const uploadFiles = async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)

    const uploadPromises = uploadFiles.map(async (uploadFile) => {
      setUploadFiles(prev => prev.map(file => 
        file.id === uploadFile.id ? { ...file, status: 'uploading', progress: 0 } : file
      ))

      const formData = new FormData()
      formData.append('file', uploadFile.file)
      formData.append('category', uploadFile.category)

      try {
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        // Simulate progress for user experience
        for (let progress = 10; progress <= 90; progress += 10) {
          setUploadFiles(prev => prev.map(file => 
            file.id === uploadFile.id ? { ...file, progress } : file
          ))
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        const data = await response.json()

        setUploadFiles(prev => prev.map(file => 
          file.id === uploadFile.id 
            ? { ...file, status: 'success', progress: 100 }
            : file
        ))

        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        
        setUploadFiles(prev => prev.map(file => 
          file.id === uploadFile.id 
            ? { ...file, status: 'error', error: errorMessage }
            : file
        ))

        throw error
      }
    })

    try {
      const results = await Promise.allSettled(uploadPromises)
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value)

      if (successful.length > 0) {
        toast.success(`Successfully uploaded ${successful.length} document(s)`)
        onUploadComplete?.(successful)
      }

      const failed = results.filter(result => result.status === 'rejected').length
      if (failed > 0) {
        toast.error(`Failed to upload ${failed} document(s)`)
      }
    } catch (error) {
      toast.error('Upload process failed')
    } finally {
      setIsUploading(false)
      
      // Clear successful uploads after a delay
      setTimeout(() => {
        setUploadFiles(prev => prev.filter(file => file.status !== 'success'))
      }, 3000)
    }
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          
          {isDragActive ? (
            <p className="text-lg">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, Excel, CSV, and TXT files (max {maxFileSize}MB each)
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Files to Upload</h3>
              <Button
                onClick={uploadFiles}
                disabled={isUploading || uploadFiles.every(f => f.status === 'success')}
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </Button>
            </div>

            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(uploadFile.status)}
                      <span className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({(uploadFile.file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.status === 'uploading'}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`category-${uploadFile.id}`} className="text-xs">
                        Category
                      </Label>
                      <Select
                        value={uploadFile.category}
                        onValueChange={(value) => updateFileCategory(uploadFile.id, value as DocumentCategory)}
                        disabled={uploadFile.status === 'uploading' || uploadFile.status === 'success'}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="h-2" />
                  )}

                  {uploadFile.status === 'error' && (
                    <p className="text-xs text-red-500">{uploadFile.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}