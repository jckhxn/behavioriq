export interface DocumentChunk {
  title: string
  content: string
  chunkIndex: number
}

export interface ChunkingOptions {
  maxChunkSize?: number
  overlapSize?: number
  preserveSentences?: boolean
}

const DEFAULT_OPTIONS: Required<ChunkingOptions> = {
  maxChunkSize: 1500,
  overlapSize: 200,
  preserveSentences: true
}

export function chunkText(
  text: string,
  title: string,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const chunks: DocumentChunk[] = []
  
  if (!text || text.trim().length === 0) {
    return chunks
  }

  // Clean and normalize text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (cleanedText.length <= opts.maxChunkSize) {
    return [{
      title,
      content: cleanedText,
      chunkIndex: 0
    }]
  }

  let startIndex = 0
  let chunkIndex = 0

  while (startIndex < cleanedText.length) {
    let endIndex = Math.min(startIndex + opts.maxChunkSize, cleanedText.length)
    
    // If we're not at the end and preserveSentences is true, try to end at a sentence boundary
    if (endIndex < cleanedText.length && opts.preserveSentences) {
      const sentenceEnd = findSentenceEnd(cleanedText, startIndex, endIndex)
      if (sentenceEnd > startIndex) {
        endIndex = sentenceEnd
      }
    }

    // Extract chunk content
    let chunkContent = cleanedText.slice(startIndex, endIndex).trim()
    
    // Ensure chunk has meaningful content
    if (chunkContent.length > 50) {
      chunks.push({
        title: `${title} (Part ${chunkIndex + 1})`,
        content: chunkContent,
        chunkIndex
      })
      chunkIndex++
    }

    // Move start index forward, accounting for overlap
    startIndex = Math.max(endIndex - opts.overlapSize, startIndex + 1)
  }

  return chunks
}

function findSentenceEnd(text: string, start: number, end: number): number {
  // Look for sentence endings near the target end position
  const searchStart = Math.max(start, end - 200)
  const substring = text.slice(searchStart, end)
  
  // Common sentence endings
  const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n']
  
  let bestEnd = -1
  for (const ending of sentenceEndings) {
    const lastIndex = substring.lastIndexOf(ending)
    if (lastIndex !== -1) {
      const absoluteIndex = searchStart + lastIndex + ending.length
      if (absoluteIndex > bestEnd && absoluteIndex <= end) {
        bestEnd = absoluteIndex
      }
    }
  }
  
  // If no sentence ending found, look for paragraph breaks
  if (bestEnd === -1) {
    const paragraphEnd = substring.lastIndexOf('\n\n')
    if (paragraphEnd !== -1) {
      bestEnd = searchStart + paragraphEnd + 2
    }
  }
  
  return bestEnd > start ? bestEnd : end
}

export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4)
}

export function validateChunkSize(chunks: DocumentChunk[], maxTokens: number = 500): boolean {
  return chunks.every(chunk => estimateTokenCount(chunk.content) <= maxTokens)
}