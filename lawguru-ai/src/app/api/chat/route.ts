import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  try {
    const { query, history } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Try Python RAG pipeline for document context (optional)
    let context = "";
    let sources: unknown[] = [];

    try {
      const pythonDir = path.join(process.cwd(), "python");
      const { stdout: contextJson } = await execFileAsync(
        "python",
        [
          path.join(pythonDir, "rag_pipeline.py"),
          "--query",
          query,
          "--k",
          "5",
        ],
        { cwd: process.cwd(), timeout: 30000 }
      );

      try {
        const result = JSON.parse(contextJson);
        context = result.context || "";
        sources = result.sources || [];
      } catch {
        context = contextJson;
      }
    } catch {
      // RAG pipeline unavailable — proceed without document context
    }

    // Build messages for LLM
    const systemPrompt = `You are LawGuru AI, an expert legal research assistant. You analyze legal questions using the IRAC framework.

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
- Ground your analysis in the provided source documents when available
- Cite specific documents from the context
- Be precise with legal terminology
- Maintain a professional, objective tone`;

    const contextMessage = context
      ? `The following are excerpts from legal documents:\n\n${context}\n\nBased on these sources, analyze the following question using the IRAC framework.`
      : "No specific documents were found. Answer based on general legal knowledge, noting that no source documents were available.";

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      {
        role: "user",
        content: `${contextMessage}\n\nQuestion: ${query}`,
      },
    ];

    // Stream LLM response
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
        max_tokens: 4096,
      }),
    });

    if (!llmResponse.ok) {
      return NextResponse.json(
        { error: `LLM API error: ${llmResponse.status}` },
        { status: 502 }
      );
    }

    // Forward the stream
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
