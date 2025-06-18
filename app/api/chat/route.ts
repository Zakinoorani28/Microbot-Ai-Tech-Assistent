import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: google("gemini-1.5-flash"),
      messages,
      system: `You are MicroBot, a helpful AI tech assistant. You specialize in:
      - Helping users choose the right tech products
      - Providing instant technical support
      - Answering questions about technology, software, and hardware
      - Being friendly, concise, and helpful
      
      Always be professional but approachable in your responses.`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
