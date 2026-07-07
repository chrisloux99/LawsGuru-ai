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

      try {
        const currentSession = sessions.find((s) => s.id === sessionId);
        const historyMessages = currentSession?.messages ?? [];

        const history = historyMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: content.trim(), history }),
        });

        if (!response.ok) throw new Error("Chat request failed");

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
      } finally {
        setIsLoading(false);
      }
    },
    [activeSessionId, sessions, isLoading]
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
  };
}
