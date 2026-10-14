import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateCheck = checkRateLimit(`chat:${ip}`, RATE_LIMITS.chat);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfter) },
      }
    );
  }

  try {
    const { query, history } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const sanitizedQuery = sanitizeString(query);

    const systemPrompt = `You are iFunde AI, an expert legal research assistant specializing in Zambian law. You analyze legal questions using the IRAC framework.

For every legal question, you MUST structure your response using these four sections with markdown headers:

## Issue
Clearly identify the legal question or dispute.

## Rule
Identify and explain the relevant legal principles, statutes, and case law.

## Application
Analyze how the rules apply to the specific facts.

## Conclusion
Provide a clear, reasoned legal conclusion.

Guidelines:
- Be precise with legal terminology
- Maintain a professional, objective tone
- Reference Zambian statutes, case law, and constitutional provisions where relevant`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: sanitizedQuery },
    ];

    const llmBase = process.env.LLM_API_BASE || "http://localhost:11434/v1";
    const llmKey = process.env.LLM_API_KEY || "";
    const llmModel = process.env.LLM_MODEL || "mimo-v2.5-pro";

    const llmResponse = await fetch(`${llmBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(llmKey ? { Authorization: `Bearer ${llmKey}` } : {}),
      },
      body: JSON.stringify({
        model: llmModel,
        messages,
        stream: true,
        temperature: 0.3,
        max_tokens: 2048,
        reasoning: { enabled: false },
        // Disable chain-of-thought for reasoning models (e.g. NVIDIA
        // Nemotron). Ignored by providers that don't know the field.
        chat_template_kwargs: { enable_thinking: false },
      }),
    });

    if (!llmResponse.ok) {
      return NextResponse.json(
        { error: `LLM API error: ${llmResponse.status}` },
        { status: 502 }
      );
    }

    return new Response(llmResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
