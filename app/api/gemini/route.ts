import { type NextRequest, NextResponse } from "next/server";

// Utility to detect Roman Urdu in user input
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
    const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!API_KEY) {
      console.error("No API key found");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const userPrompt =
      prompt || messages?.[messages.length - 1]?.content || "Hello";
    const isRomanUrdu = detectRomanUrdu(userPrompt);

    // Adjust response style based on prompt length
    const promptLength = userPrompt.trim().split(/\s+/).length;
    const isShort = promptLength < 8;

    const systemPrompt = isRomanUrdu
      ? `Tum MicroBot ho — ek madadgar AI tech assistant. Jab user Roman Urdu mein likhta hai, tum Roman Urdu + English technical terms mein jawab do. Short sawalon ke liye short aur seedha jawab do. Agar user detail maange to detail mein jawab do.`
      : `You are MicroBot — a helpful and friendly AI tech assistant. If the user's question is short, respond concisely. If the user asks for a detailed explanation, provide one. Keep tone helpful, clear, and tech-savvy.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nUser: ${userPrompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: isShort ? 300 : 1024, // Dynamic response size
      },
    };

    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!result.ok) {
      const errorText = await result.text();
      console.error("Gemini API Error Response:", errorText);

      let errorMessage = "Failed to get response from Gemini";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        // ignore JSON parse error
      }

      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: result.status }
      );
    }

    const json = await result.json();
    const reply =
      json.candidates?.[0]?.content?.parts?.[0]?.text || "No reply generated.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
