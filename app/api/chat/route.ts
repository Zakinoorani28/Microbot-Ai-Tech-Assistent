import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

const aiml = createOpenAI({
  apiKey: process.env.AIML_API_KEY!,
  baseURL: "https://api.aimlapi.com/v1",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: aiml("gpt-4o-mini"),
      messages,
      system: `You are MicroBot, a helpful AI tech assistant. You specialize in:
      - Helping users choose the right tech products
      - Providing instant technical support
      - Answering questions about technology, software, and hardware
      - Being friendly, concise, and helpful

      Always be professional but approachable in your responses.`,
      maxOutputTokens: 1024, // ✅ correct field name
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.8,
      presencePenalty: 0.3,
    });

    // ✅ updated method name
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
