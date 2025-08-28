import { type NextRequest, NextResponse } from "next/server";

// You can keep node runtime for stable streaming (edge also works, but Node is safer with some hosts).
export const runtime = "nodejs";

// ✅ AIML (OpenAI-compatible) endpoint
const API_URL = "https://api.aimlapi.com/v1/chat/completions";

// ✅ Utility to detect Roman Urdu in user input
function detectRomanUrdu(text: string): boolean {
  const romanUrduPatterns = [
    /\b(aap|ap|hum|main|mein|hai|hain|ka|ki|ke|ko|se|par|or|aur|kya|kaise|kahan|kab|kyun|jo|jis|agar|lekin|phir|abhi|yahan|wahan|yeh|ye|woh|wo|iska|uska|hamara|tumhara|apka)\b/i,
    /\b(kya|kaise|kahan|kab|kyun|kaun|kitna|kitni|kitne)\b/i,
    /\b(batao|bataiye|samjhao|samjhaiye|dekho|dekhiye|suno|suniye|karo|kariye|acha|accha|theek|thik|bilkul|zaroor|shayad)\b/i,
    /\b(router|device|mobile|phone|laptop|internet|wifi|network|app|website|email|settings)\s+(ka|ki|ke|ko|se|mein|par|hai|hain)\b/i,
  ];
  return romanUrduPatterns.some((pattern) => pattern.test(text));
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, messages } = await req.json();
    const API_KEY = process.env.AIML_API_KEY; // 🔑 set in .env.local

    if (!API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const userPrompt: string =
      prompt || messages?.[messages.length - 1]?.content || "Hello";
    const isRomanUrdu = detectRomanUrdu(userPrompt);

    // Dynamic system prompt
    const systemPrompt = isRomanUrdu
      ? `Tum MicroBot ho — ek madadgar AI tech assistant. Jab user Roman Urdu mein likhta hai, tum Roman Urdu + English technical terms mein jawab do. Short sawalon ke liye short aur seedha jawab do. Agar user detail maange to detail mein jawab do.`
      : `You are MicroBot — a helpful and friendly AI tech assistant. If the user's question is short, respond concisely. If the user asks for a detailed explanation, provide one. Keep tone helpful, clear, and tech-savvy.`;

    // Build OpenAI-style message list: system + prior messages + latest user prompt
    const openAIMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(messages)
        ? messages
            .filter((m: any) => m?.role && m?.content)
            .map((m: any) => ({
              role: (m.role === "assistant" ? "assistant" : "user") as
                | "user"
                | "assistant",
              content: String(m.content),
            }))
        : []),
      { role: "user", content: userPrompt },
    ];

    // Request with streaming enabled
    const upstream = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or gpt-4o
        messages: openAIMessages,
        temperature: 0.7,
        top_p: 0.8,
        max_tokens: 1024,
        frequency_penalty: 1,
        presence_penalty: 0.3,
        stream: true, // 👈 enable streaming
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => "");
      return NextResponse.json(
        {
          error: "AIML API error",
          details: errorText || `HTTP ${upstream.status}`,
        },
        { status: upstream.status }
      );
    }

    // 🔁 Stream upstream SSE directly to the client
    const headers = new Headers({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Allow browser to read stream in dev proxies
      "Transfer-Encoding": "chunked",
    });

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("❌ /api/microbot error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
