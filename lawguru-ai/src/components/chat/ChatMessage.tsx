"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FaUser, FaBalanceScale, FaCopy, FaCheck, FaRedo } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import IRACBlock from "./IRACBlock";
import type { ChatMessage as ChatMessageType } from "@/types";

interface Props {
  message: ChatMessageType;
  onRetry?: (messageId: string) => void;
}

export default function ChatMessage({ message, onRetry }: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const isError = message.content.includes("I encountered an error") ||
    message.content.includes("*(Generation stopped)*");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-surface-tertiary border border-earth-700"
            : "bg-gold/10 border border-gold/20"
        }`}
      >
        {isUser ? (
          <FaUser className="w-4 h-4 text-earth-400" />
        ) : (
          <FaBalanceScale className="w-4 h-4 text-gold" />
        )}
      </div>

      <div className={`flex-1 max-w-3xl ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block rounded-2xl px-5 py-3 ${
            isUser
              ? "bg-surface-tertiary border border-earth-700 text-earth-100"
              : ""
          }`}
        >
          {isUser ? (
            <p className="font-body text-sm leading-relaxed">{message.content}</p>
          ) : message.irac ? (
            <IRACBlock irac={message.irac} />
          ) : (
            <div className="font-body text-sm leading-relaxed text-earth-200 prose-earth">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="font-heading text-base font-bold text-earth-100 mt-4 mb-2 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-heading text-sm font-bold text-earth-200 mt-3 mb-1.5">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1 text-earth-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1 text-earth-300">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-earth-100">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-earth-300">{children}</em>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="px-1.5 py-0.5 rounded bg-surface-tertiary text-copper text-xs font-mono">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="block p-3 rounded-lg bg-surface-tertiary text-earth-200 text-xs font-mono overflow-x-auto mb-2">
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-gold/30 pl-3 italic text-earth-400 mb-2">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions row */}
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? "justify-end" : ""}`}>
          <span className="text-xs text-earth-600">
            {formatDate(message.timestamp)}
          </span>
          {!isUser && message.content && (
            <>
              <button
                onClick={handleCopy}
                className="p-1 rounded text-earth-600 hover:text-earth-300 transition-colors cursor-pointer"
                aria-label={copied ? "Copied" : "Copy message"}
              >
                {copied ? (
                  <FaCheck className="w-3 h-3 text-zambia-green" />
                ) : (
                  <FaCopy className="w-3 h-3" />
                )}
              </button>
              {isError && onRetry && (
                <button
                  onClick={() => onRetry(message.id)}
                  className="p-1 rounded text-earth-600 hover:text-copper transition-colors cursor-pointer"
                  aria-label="Retry message"
                >
                  <FaRedo className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
