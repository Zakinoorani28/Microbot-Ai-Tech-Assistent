import { type NextRequest, NextResponse } from "next/server";

// ✅ AIML API endpoint
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
      console.error("❌ AIML_API_KEY not found in environment");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // ✅ Extract last user input
    const userPrompt =
      prompt || messages?.[messages.length - 1]?.content || "Hello";
    const isRomanUrdu = detectRomanUrdu(userPrompt);

    // ✅ Adjust response style based on input length
    const promptLength = userPrompt.trim().split(/\s+/).length;
    const isShort = promptLength < 8;

    // ✅ Dynamic system prompt
    const systemPrompt = isRomanUrdu
      ? `Tum MicroBot ho — ek madadgar AI tech assistant. Jab user Roman Urdu mein likhta hai, tum Roman Urdu + English technical terms mein jawab do. Short sawalon ke liye short aur seedha jawab do. Agar user detail maange to detail mein jawab do.`
      : `You are MicroBot — a helpful and friendly AI tech assistant. If the user's question is short, respond concisely. If the user asks for a detailed explanation, provide one. Keep tone helpful, clear, and tech-savvy.`;

    // ✅ AIML API request (OpenAI compatible)
    const requestBody = {
      model: "gpt-4o-mini", // or gpt-4, gpt-4o
      messages: [
        { role: "system", content: systemPrompt },
        ...(messages || []),
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      top_p: 0.8,
      max_tokens: isShort ? 300 : 1024,
      frequency_penalty: 1,
      presence_penalty: 0.3,
    };

    const result = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error("❌ AIML API Error Response:", errorText);

      let errorMessage = "Failed to get response from AIML API";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        // ignore parse error
      }

      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: result.status }
      );
    }

    // ✅ Parse AIML API response
    const json = await result.json();
    const reply = json.choices?.[0]?.message?.content || "No reply generated.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("❌ API Route Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
