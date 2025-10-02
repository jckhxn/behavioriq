import { ConversationalAIProvider } from "./types";
import { MockConversationalAI } from "./MockConversationalAI";
import { OpenAIConversationalAI } from "./OpenAIConversationalAI";

export class ConversationalAIFactory {
  static create(isTrial: boolean = false): ConversationalAIProvider {
    // Use mock for trial assessments to avoid API costs
    if (isTrial) {
      return new MockConversationalAI();
    }

    // Use real OpenAI for paid assessments (requires OPENAI_API_KEY)
    if (process.env.OPENAI_API_KEY) {
      return new OpenAIConversationalAI();
    }

    // Fallback to mock if no API key configured
    console.warn("No OpenAI API key found, using mock conversational AI");
    return new MockConversationalAI();
  }
}
