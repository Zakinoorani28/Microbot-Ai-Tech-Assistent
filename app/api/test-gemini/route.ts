import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        {
          error: "API key not found",
          hasKey: false,
        },
        { status: 500 }
      );
    }

    // Test with a simple request
    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "Say hello" }],
            },
          ],
        }),
      }
    );

    const responseText = await result.text();

    return NextResponse.json({
      hasKey: true,
      keyLength: API_KEY.length,
      status: result.status,
      ok: result.ok,
      response: responseText.substring(0, 500), // First 500 chars
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
