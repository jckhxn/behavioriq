import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { processDocument, isFileTypeSupported } from '@/lib/documents/processors'
import { chunkText } from '@/lib/documents/chunker'
import { storeDocumentWithEmbeddings } from '@/lib/documents/embeddings'
import { DocumentCategory } from '@prisma/client'
import { z } from 'zod'

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      )
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !isFileTypeSupported(fileExtension)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    // Validate category
    if (!Object.values(DocumentCategory).includes(category as DocumentCategory)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Process file
    const buffer = Buffer.from(await file.arrayBuffer())
    const extractedText = await processDocument(buffer, fileExtension)

    if (!extractedText || extractedText.trim().length < 100) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from file' },
        { status: 400 }
      )
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        fileName: file.name,
        fileType: fileExtension,
        fileSize: file.size,
        category: category as DocumentCategory,
        content: extractedText,
        userId: session.user.id
      }
    })

    // Chunk the text
    const chunks = chunkText(extractedText, document.title)

    // Store chunks with embeddings
    const chunksWithMetadata = chunks.map(chunk => ({
      ...chunk,
      category: document.category
    }))

    await storeDocumentWithEmbeddings(
      document.id,
      chunksWithMetadata,
      session.user.id
    )

    return NextResponse.json({
      message: 'Document uploaded and processed successfully',
      document: {
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        category: document.category,
        chunksCount: chunks.length,
        createdAt: document.createdAt
      }
    })
  } catch (error) {
    console.error('Document upload error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('embedding')) {
        return NextResponse.json(
          { error: 'Failed to process document for search. Please try again.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}