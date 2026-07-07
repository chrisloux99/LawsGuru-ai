"use client";

import { FaUser, FaBalanceScale } from "react-icons/fa";
import { formatDate } from "@/lib/utils";
import IRACBlock from "./IRACBlock";
import type { ChatMessage as ChatMessageType } from "@/types";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

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
            <div className="font-body text-sm leading-relaxed text-earth-200 whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>
        <p className="text-xs text-earth-600 mt-1 px-1">
          {formatDate(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
