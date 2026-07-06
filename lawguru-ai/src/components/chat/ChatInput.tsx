"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { FaPaperPlane } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Props {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    onSend(value);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-panel p-3 flex items-end gap-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about Zambian law, statutes, case precedent..."
        rows={1}
        className="flex-1 bg-transparent text-sm text-earth-100 placeholder:text-earth-600 font-body resize-none focus:outline-none py-2 px-2 max-h-[200px]"
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper to-gold text-surface-primary flex items-center justify-center transition-all duration-300 hover:from-gold hover:to-copper disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-copper-glow"
        aria-label="Send message"
      >
        {isLoading ? (
          <LoadingSpinner size={18} />
        ) : (
          <FaPaperPlane className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
