"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { generateId, parseIRACSections } from "@/lib/utils";
import type { ChatMessage, ChatSession, IRACResponse } from "@/types";

const STORAGE_KEY = "lawguru-chat-sessions";

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((s: ChatSession) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
      messages: s.messages.map((m: ChatMessage) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // localStorage full or unavailable
  }
}

function deriveTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New conversation";
  const text = firstUser.content.trim();
  return text.length > 60 ? text.slice(0, 60) + "…" : text;
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const initialized = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const loaded = loadSessions();
    setSessions(loaded);
    if (loaded.length > 0) {
      setActiveSessionId(loaded[0].id);
    }
  }, []);

  // Persist sessions whenever they change
  useEffect(() => {
    if (!initialized.current) return;
    saveSessions(sessions);
  }, [sessions]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const messages = sessions.find((s) => s.id === activeSessionId)?.messages ?? [];

  const startNewChat = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  const loadSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      return next;
    });
    setActiveSessionId((prev) => (prev === sessionId ? null : prev));
  }, []);

  const stopGenerating = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      let sessionId = activeSessionId;

      // Create new session if needed
      if (!sessionId) {
        sessionId = generateId();
        const newSession: ChatSession = {
          id: sessionId,
          title: deriveTitle([userMsg]),
          messages: [userMsg],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(sessionId);
      } else {
        // Add user message to existing session
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, userMsg],
                  updatedAt: new Date(),
                  title:
                    s.messages.length === 0
                      ? deriveTitle([userMsg])
                      : s.title,
                }
              : s
          )
        );
      }

      setIsLoading(true);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const currentSession = sessions.find((s) => s.id === sessionId);
        const historyMessages = currentSession?.messages ?? [];

        const history = historyMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const apiBase = process.env.NEXT_PUBLIC_LLM_API_BASE || "http://localhost:11434/v1";
        const apiKey = process.env.NEXT_PUBLIC_LLM_API_KEY || "";
        const model = process.env.NEXT_PUBLIC_LLM_MODEL || "mimo-v2.5-pro";

        const systemPrompt = `You are LawGuru AI, an expert legal research assistant specializing in Zambian law. You analyze legal questions using the IRAC framework.

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
          ...history,
          { role: "user", content: content.trim() },
        ];

        const response = await fetch(`${apiBase}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
            temperature: 0.3,
            max_tokens: 2048,
            reasoning: { enabled: false },
          }),
          signal: abortController.signal,
        });

        if (!response.ok) throw new Error(`LLM API error: ${response.status}`);

        const assistantMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: "",
          timestamp: new Date(),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: new Date() }
              : s
          )
        );

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === sessionId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantMsg.id
                              ? { ...m, content: fullText }
                              : m
                          ),
                          updatedAt: new Date(),
                        }
                      : s
                  )
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        // Parse IRAC sections from the final text
        const sections = parseIRACSections(fullText);
        const hasIRAC = sections.issue || sections.rule;

        if (hasIRAC) {
          const irac: IRACResponse = {
            ...sections,
            sources: [],
            raw: fullText,
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsg.id ? { ...m, irac } : m
                    ),
                    updatedAt: new Date(),
                  }
                : s
            )
          );
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          // User cancelled — mark partial response if any
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== sessionId) return s;
              const lastMsg = s.messages[s.messages.length - 1];
              if (lastMsg?.role === "assistant" && lastMsg.content) {
                // Keep partial response
                return { ...s, updatedAt: new Date() };
              }
              // No partial content — add cancelled notice
              return {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    id: generateId(),
                    role: "assistant" as const,
                    content: "*(Generation stopped)*",
                    timestamp: new Date(),
                  },
                ],
                updatedAt: new Date(),
              };
            })
          );
        } else {
          const errorMsg: ChatMessage = {
            id: generateId(),
            role: "assistant",
            content:
              "I encountered an error processing your request. Please check that the LLM service is running and try again.",
            timestamp: new Date(),
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? { ...s, messages: [...s.messages, errorMsg], updatedAt: new Date() }
                : s
            )
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [activeSessionId, sessions, isLoading]
  );

  const retryMessage = useCallback(
    (messageId: string) => {
      const session = sessions.find((s) => s.id === activeSessionId);
      if (!session) return;

      // Find the user message before this assistant message
      const msgIndex = session.messages.findIndex((m) => m.id === messageId);
      if (msgIndex <= 0) return;

      // Remove the failed assistant message and retry
      const userMsg = session.messages[msgIndex - 1];
      if (userMsg.role !== "user") return;

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: s.messages.filter((_, i) => i !== msgIndex) }
            : s
        )
      );

      // Small delay to let state update, then resend
      setTimeout(() => sendMessage(userMsg.content), 50);
    },
    [activeSessionId, sessions, sendMessage]
  );

  return {
    messages,
    sessions,
    activeSessionId,
    isLoading,
    sendMessage,
    startNewChat,
    loadSession,
    deleteSession,
    stopGenerating,
    retryMessage,
  };
}
