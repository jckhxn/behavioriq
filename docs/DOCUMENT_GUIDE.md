# Document Management & Knowledge Chat Guide

This guide explains how to manage documents and customize the knowledge chat system for AI-powered document question answering.

## Table of Contents

- [Document System Overview](#document-system-overview)
- [Adding Documents](#adding-documents)
- [Document Categories](#document-categories)
- [Knowledge Chat Configuration](#knowledge-chat-configuration)
- [Embedding Management](#embedding-management)
- [Customizing Search](#customizing-search)
- [Managing Suggested Questions](#managing-suggested-questions)
- [Troubleshooting](#troubleshooting)

## Document System Overview

The knowledge chat system uses:

1. **Document Storage**: Files uploaded and stored in the database
2. **Text Chunking**: Documents split into searchable chunks
3. **Vector Embeddings**: AI-generated embeddings for semantic search
4. **Similarity Search**: Finding relevant content using vector similarity
5. **Contextual Response**: AI generates answers using retrieved content

## Adding Documents

### Through the UI

1. **Navigate to Knowledge Tab**
2. **Click Upload Button** (📤)
3. **Select Files** (PDF, DOCX, TXT supported)
4. **Choose Category** from dropdown
5. **Wait for Processing** (chunking + embedding generation)

### Programmatically

```typescript
import { storeDocumentWithEmbeddings } from '@/lib/documents/embeddings'
import { DocumentCategory } from '@prisma/client'

// Add a document with chunks
await storeDocumentWithEmbeddings(
  documentId,
  [
    {
      title: "Section 1: Overview",
      content: "This section covers...",
      category: DocumentCategory.POLICY,
      chunkIndex: 0
    },
    {
      title: "Section 2: Implementation",
      content: "Implementation steps...",
      category: DocumentCategory.POLICY,
      chunkIndex: 1
    }
  ],
  userId
)
```

### Bulk Import via Seed File

Add sample documents to `prisma/seed.ts`:

```typescript
const sampleDocuments = [
  {
    title: 'Your Document Title',
    fileName: 'your-document.pdf',
    fileType: 'pdf',
    fileSize: 1024000, // in bytes
    category: DocumentCategory.POLICY,
    content: `Your document content here...

This will be automatically chunked and embedded.`,
    userId: admin.id
  },
  // Add more documents...
]
```

Then run:
```bash
npx prisma db seed
```

## Document Categories

### Available Categories

Configure categories in `/lib/config/ai-config.ts`:

```typescript
export const KNOWLEDGE_CONFIG = {
  CATEGORIES: {
    [DocumentCategory.POLICY]: {
      name: 'Policy',
      emoji: '📋',
      description: 'Organizational policies and rules',
    },
    [DocumentCategory.PROCEDURE]: {
      name: 'Procedure',
      emoji: '⚙️',
      description: 'Step-by-step procedures and workflows',
    },
    [DocumentCategory.GUIDELINE]: {
      name: 'Guideline',
      emoji: '📝',
      description: 'Guidelines and best practices',
    },
    [DocumentCategory.MANUAL]: {
      name: 'Manual',
      emoji: '📖',
      description: 'User manuals and documentation',
    },
    [DocumentCategory.ASSESSMENT_TOOL]: {
      name: 'Assessment Tool',
      emoji: '🧮',
      description: 'Assessment instruments and tools',
    },
    [DocumentCategory.REFERENCE]: {
      name: 'Reference',
      emoji: '🔗',
      description: 'Reference materials and resources',
    },
    [DocumentCategory.OTHER]: {
      name: 'Other',
      emoji: '📄',
      description: 'Other documents and materials',
    },
  }
}
```

### Adding New Categories

1. **Update Database Schema** (`prisma/schema.prisma`):
```prisma
enum DocumentCategory {
  POLICY
  PROCEDURE
  GUIDELINE
  MANUAL
  ASSESSMENT_TOOL
  REFERENCE
  OTHER
  YOUR_NEW_CATEGORY  // Add here
}
```

2. **Add Category Configuration**:
```typescript
[DocumentCategory.YOUR_NEW_CATEGORY]: {
  name: 'Your Category Name',
  emoji: '🆕',
  description: 'Description of this category',
},
```

3. **Update UI Components** (`components/chat/KnowledgeChat.tsx`):
```tsx
<SelectItem value="YOUR_NEW_CATEGORY">🆕 Your Category Name</SelectItem>
```

4. **Run Migration**:
```bash
npx prisma migrate dev --name add-new-category
```

## Knowledge Chat Configuration

### Search Parameters

Configure search behavior in `ai-config.ts`:

```typescript
export const AI_PARAMETERS = {
  KNOWLEDGE: {
    TEMPERATURE: 0.3,                    // Response creativity
    MAX_TOKENS: 1000,                    // Response length limit
    CONTEXT_WINDOW: 20,                  // Messages to keep in history
    CONVERSATION_CONTEXT_LIMIT: 6,       // Messages in context for AI
    SEARCH_LIMIT: 5,                     // Max documents to retrieve
    SEARCH_THRESHOLD: 0.6,               // Minimum similarity score
    HIGH_SIMILARITY_THRESHOLD: 0.7,      // High confidence threshold
    MIN_SIMILARITY_FOR_CONTEXT: 0.6,     // Minimum to include in context
    CONFIDENCE_BOOST_FACTOR: 1.2,        // Confidence calculation boost
    MAX_CONFIDENCE: 0.95,                // Maximum confidence cap
  }
}
```

### System Prompt

Customize how the AI responds using documents:

```typescript
export const SYSTEM_PROMPTS = {
  KNOWLEDGE_RESPONSE: `You are a knowledgeable AI assistant helping users find information from their document collection.

Guidelines:
- Provide accurate, helpful answers based solely on the provided context
- Be concise but comprehensive
- If information is incomplete, acknowledge limitations
- Always cite which documents you're referencing
- Maintain conversational tone while being informative
- If the context doesn't contain relevant information, say so clearly

Provide a helpful response that answers the user's question using the available context.`
}
```

## Embedding Management

### Embedding Models

Configure which OpenAI embedding model to use:

```typescript
export const AI_MODELS = {
  EMBEDDING: {
    PRIMARY: 'text-embedding-3-small',  // Faster, good quality
    LARGE: 'text-embedding-3-large',    // Slower, higher quality
  }
}
```

### Chunking Strategy

The system automatically chunks documents. Customize chunk size in the upload processing:

```typescript
// In document processing (you may need to modify the upload handler)
const CHUNK_SIZE = 500  // Characters per chunk
const CHUNK_OVERLAP = 50  // Character overlap between chunks
```

### Re-generating Embeddings

If you change embedding models or need to regenerate:

```typescript
// Create a migration script
import { createEmbedding } from '@/lib/ai/openai'
import { prisma } from '@/lib/db/prisma'

async function regenerateEmbeddings() {
  const chunks = await prisma.documentChunk.findMany({
    where: { embedding: null } // Or all chunks if regenerating
  })

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.content)
    await prisma.documentChunk.update({
      where: { id: chunk.id },
      data: { embedding }
    })
  }
}
```

## Customizing Search

### Search Algorithm

The search uses PostgreSQL's pgvector for similarity search. Modify in `lib/documents/embeddings.ts`:

```typescript
// Current search query
const results = await prisma.$queryRawUnsafe<SearchResult[]>(
  `SELECT
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
  LIMIT $${params.length + 3}`,
  ...params, queryEmbedding, threshold, limit
)
```

### Custom Search Options

Extend the search function with additional filters:

```typescript
interface SearchOptions {
  limit?: number
  threshold?: number
  categories?: DocumentCategory[]
  dateRange?: { start: Date; end: Date }  // Add custom filters
  fileTypes?: string[]
  minChunkSize?: number
}
```

### Search Quality Improvements

1. **Query Expansion**: Add synonyms to search queries
2. **Reranking**: Post-process results for better relevance
3. **Hybrid Search**: Combine vector search with keyword search
4. **User Feedback**: Learn from user satisfaction ratings

## Managing Suggested Questions

### Default Questions

Configure in `ai-config.ts`:

```typescript
export const KNOWLEDGE_CONFIG = {
  DEFAULT_SUGGESTIONS: [
    "What are the key policies I should be aware of?",
    "Can you summarize the main procedures?",
    "What assessment tools are available?",
    "Help me understand the guidelines for...",
    "What information do you have about...?",
  ]
}
```

### Category-Specific Questions

Add questions that appear when certain document categories are present:

```typescript
CATEGORY_SUGGESTIONS: {
  [DocumentCategory.POLICY]: [
    "What's our policy on...",
    "Are there any policy updates regarding...",
    "How does the policy handle...",
  ],
  [DocumentCategory.PROCEDURE]: [
    "How do I follow the procedure for...",
    "What are the steps to...",
    "Can you walk me through the process of...",
  ],
  // Add more categories...
}
```

### Dynamic Question Generation

The `KnowledgeAI.getSuggestedQuestions()` method automatically generates suggestions based on:

1. **User's documents**: What categories they have uploaded
2. **Recent activity**: Documents accessed recently
3. **Popular queries**: Most common questions (you can implement this)

### Custom Question Logic

```typescript
// In KnowledgeAI.getSuggestedQuestions()
async getSuggestedQuestions(): Promise<string[]> {
  try {
    // Get user's document categories
    const recentDocs = await prisma.document.findMany({
      where: { userId: this.context.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { title: true, category: true }
    })

    // Generate category-specific suggestions
    const categories = [...new Set(recentDocs.map(doc => doc.category))]
    return getCategorySuggestions(categories)
  } catch (error) {
    // Return fallback suggestions
    return KNOWLEDGE_CONFIG.DEFAULT_SUGGESTIONS
  }
}
```

## Document Processing Pipeline

### Upload Flow

1. **File Upload** → API endpoint receives file
2. **Validation** → Check file type, size, permissions
3. **Text Extraction** → Extract text from PDF/DOCX/TXT
4. **Chunking** → Split into manageable pieces
5. **Embedding Generation** → Create vector embeddings
6. **Database Storage** → Store document + chunks + embeddings

### Supported File Types

Currently supported:
- **PDF**: Text extraction via PDF parsing
- **DOCX**: Microsoft Word documents
- **TXT**: Plain text files

### Adding New File Types

1. **Add File Type Support** in upload handler
2. **Create Text Extractor** for the new format
3. **Update UI** to accept new file types
4. **Test Processing Pipeline**

Example for adding RTF support:

```typescript
// In document upload handler
async function extractText(file: File): Promise<string> {
  switch (file.type) {
    case 'application/pdf':
      return extractFromPDF(file)
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractFromDOCX(file)
    case 'text/plain':
      return file.text()
    case 'text/rtf':  // New format
      return extractFromRTF(file)
    default:
      throw new Error('Unsupported file type')
  }
}
```

## Administrative Features

### Document Management Dashboard

Admin users can:

1. **View All Documents** in the system
2. **Delete Documents** and their embeddings
3. **Re-process Documents** if needed
4. **Monitor Usage** and search patterns

### Bulk Operations

```typescript
// Example: Delete all documents in a category
async function deleteDocumentsByCategory(category: DocumentCategory) {
  const documents = await prisma.document.findMany({
    where: { category }
  })

  for (const doc of documents) {
    await deleteDocumentEmbeddings(doc.id)
    await prisma.document.delete({ where: { id: doc.id } })
  }
}
```

## Performance Optimization

### Database Indexing

Ensure proper indexes for vector search:

```sql
-- Add index for embedding similarity search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_document_chunks_user_id
ON document_chunks(userId);

CREATE INDEX IF NOT EXISTS idx_document_chunks_category
ON document_chunks(category);
```

### Caching Strategy

1. **Embedding Cache**: Cache embeddings for common queries
2. **Search Results Cache**: Cache search results temporarily
3. **Document Content Cache**: Cache frequently accessed documents

### Monitoring

Track important metrics:
- **Search response time**
- **Embedding generation time**
- **User satisfaction with results**
- **Most searched content**
- **Failed searches**

## Troubleshooting

### Common Issues

1. **No search results**: Check embedding generation and similarity thresholds
2. **Poor result quality**: Adjust search parameters or improve document content
3. **Slow search**: Optimize database queries and add proper indexing
4. **Embedding errors**: Verify OpenAI API key and rate limits

### Debug Tools

```typescript
// Add to search function for debugging
console.log('Search query:', query)
console.log('Retrieved chunks:', results.length)
console.log('Similarity scores:', results.map(r => r.similarity))
```

### Performance Monitoring

```typescript
// Track search performance
const startTime = Date.now()
const results = await searchSimilarDocuments(query, userId, options)
const duration = Date.now() - startTime
console.log(`Search completed in ${duration}ms`)
```

## Security Considerations

### Access Control

- Users can only search **their own documents**
- Admin users can access **all documents**
- Document sharing requires **explicit permissions**

### Data Privacy

- **Embeddings** contain semantic information about content
- **Search logs** may contain sensitive queries
- **Document content** should be encrypted at rest

### API Security

- **Rate limiting** on search endpoints
- **Input validation** for all queries
- **Authentication** required for all operations