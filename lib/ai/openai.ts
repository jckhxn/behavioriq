import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Error creating embedding:', error)
    throw new Error('Failed to create embedding')
  }
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    })
    
    return response.data.map(item => item.embedding)
  } catch (error) {
    console.error('Error creating embeddings:', error)
    throw new Error('Failed to create embeddings')
  }
}

export async function generateChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: {
    model?: string
    temperature?: number
    maxTokens?: number
    stream?: boolean
  } = {}
) {
  const {
    model = 'gpt-4',
    temperature = 0.7,
    maxTokens = 1000,
    stream = false
  } = options

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream
    })
    
    return response
  } catch (error) {
    console.error('Error generating chat completion:', error)
    throw new Error('Failed to generate response')
  }
}