import { openai } from "@ai-sdk/openai";
import { generateText, embed } from "ai";

// Chat completion using AI SDK with GPT-4o mini
export async function getChatCompletion(
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>
) {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    messages,
  });
  return text;
}

// Embeddings using AI SDK
export async function getEmbeddings(input: string) {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: input,
  });
  return embedding;
}

// Simple AI response generation for recommendations
export async function generateAIResponse(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
) {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "user" as const,
        content: prompt,
      },
    ],
    temperature: options?.temperature || 0.7,
  });
  return text;
}
