"use client";

import { useState, useCallback } from "react";
import { generateId, parseIRACSections } from "@/lib/utils";
import type { ChatMessage, IRACResponse } from "@/types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const history = messages.map((m) => ({
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

        setMessages((prev) => [...prev, assistantMsg]);

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          fullText += decoder.decode(value, { stream: true });

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: fullText } : m
            )
          );
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
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, irac } : m
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
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  return { messages, isLoading, sendMessage };
}
