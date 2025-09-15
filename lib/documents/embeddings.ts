import { prisma } from '@/lib/db/prisma'
import { createEmbedding, createEmbeddings } from '@/lib/ai/openai'
import { DocumentCategory } from '@prisma/client'

export interface SearchResult {
  id: string
  title: string
  content: string
  category: DocumentCategory
  documentId: string
  similarity: number
  document: {
    title: string
    fileName: string
    category: DocumentCategory
  }
}

export async function storeDocumentWithEmbeddings(
  documentId: string,
  chunks: Array<{
    title: string
    content: string
    category: DocumentCategory
    chunkIndex: number
  }>,
  userId: string
): Promise<void> {
  try {
    // Create embeddings for all chunks
    const contents = chunks.map(chunk => chunk.content)
    const embeddings = await createEmbeddings(contents)

    // Store chunks with embeddings in parallel
    const chunkPromises = chunks.map((chunk, index) => {
      return prisma.documentChunk.create({
        data: {
          title: chunk.title,
          content: chunk.content,
          category: chunk.category,
          chunkIndex: chunk.chunkIndex,
          embedding: embeddings[index],
          documentId,
          userId
        }
      })
    })

    await Promise.all(chunkPromises)
  } catch (error) {
    console.error('Error storing document embeddings:', error)
    throw new Error('Failed to store document embeddings')
  }
}

export async function searchSimilarDocuments(
  query: string,
  userId: string,
  options: {
    limit?: number
    threshold?: number
    categories?: DocumentCategory[]
  } = {}
): Promise<SearchResult[]> {
  const { limit = 5, threshold = 0.7, categories } = options

  try {
    // Create embedding for the query
    const queryEmbedding = await createEmbedding(query)
    
    // Build the WHERE clause
    let whereClause = `"userId" = $1`
    const params: any[] = [userId]
    
    if (categories && categories.length > 0) {
      whereClause += ` AND "category" = ANY($${params.length + 1})`
      params.push(categories)
    }

    // Perform vector similarity search using pgvector
    const results = await prisma.$queryRawUnsafe<Array<{
      id: string
      title: string
      content: string
      category: DocumentCategory
      documentId: string
      similarity: number
      document_title: string
      document_fileName: string
      document_category: DocumentCategory
    }>>`
      SELECT 
        dc.id,
        dc.title,
        dc.content,
        dc.category,
        dc."documentId",
        1 - (dc.embedding <=> $${params.length + 1}::vector) as similarity,
        d.title as document_title,
        d."fileName" as document_fileName,
        d.category as document_category
      FROM "document_chunks" dc
      JOIN "documents" d ON dc."documentId" = d.id
      WHERE ${whereClause}
        AND dc.embedding IS NOT NULL
        AND 1 - (dc.embedding <=> $${params.length + 1}::vector) >= $${params.length + 2}
      ORDER BY dc.embedding <=> $${params.length + 1}::vector
      LIMIT $${params.length + 3}
    `, ...params, queryEmbedding, threshold, limit)

    return results.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      category: result.category,
      documentId: result.documentId,
      similarity: result.similarity,
      document: {
        title: result.document_title,
        fileName: result.document_fileName,
        category: result.document_category
      }
    }))
  } catch (error) {
    console.error('Error searching similar documents:', error)
    throw new Error('Failed to search documents')
  }
}

export async function deleteDocumentEmbeddings(documentId: string): Promise<void> {
  try {
    await prisma.documentChunk.deleteMany({
      where: { documentId }
    })
  } catch (error) {
    console.error('Error deleting document embeddings:', error)
    throw new Error('Failed to delete document embeddings')
  }
}

export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}