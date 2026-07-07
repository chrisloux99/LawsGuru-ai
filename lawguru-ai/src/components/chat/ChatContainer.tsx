"use client";

import { useRef, useEffect } from "react";
import { FaBalanceScale, FaGavel, FaMagic } from "@/components/icons";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useChat } from "./useChat";
import Sidebar from "@/components/layout/Sidebar";

const suggestions = [
  "What are the elements of a valid contract under Zambian law?",
  "Explain the doctrine of precedent in the Zambian court system",
  "What does the Constitution of Zambia say about fundamental rights?",
  "How does the Lands Act No. 29 of 1995 affect land tenure?",
  "What is the role of the Local Courts in Zambia's justice system?",
  "Explain the difference between civil and criminal jurisdiction in Zambia",
];

export default function ChatContainer() {
  const {
    messages,
    sessions,
    activeSessionId,
    isLoading,
    sendMessage,
    startNewChat,
    loadSession,
    deleteSession,
  } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={startNewChat}
        onLoadSession={loadSession}
        onDeleteSession={deleteSession}
      />
      <main className="flex-1 lg:ml-64 flex flex-col pt-20">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
              <div className="animate-fade-in-up">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 mx-auto copper-glow">
                  <FaBalanceScale className="w-10 h-10 text-gold" />
                </div>

                <h2 className="font-heading text-3xl font-extrabold text-earth-100 mb-3">
                  Ask a legal question
                </h2>
                <p className="text-earth-400 font-body mb-8 max-w-lg">
                  Get structured IRAC analysis grounded in Zambian law — with
                  cited sources from your document library.
                </p>

                {/* Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="glass-panel p-4 text-left text-sm text-earth-300 hover:text-earth-100 hover:border-copper/30 transition-all duration-300 cursor-pointer group"
                    >
                      <FaMagic className="w-3.5 h-3.5 text-copper mb-2 group-hover:text-gold transition-colors" />
                      {s}
                    </button>
                  ))}
                </div>

                {/* Zambian court hierarchy note */}
                <div className="mt-8 glass-panel p-3 max-w-sm mx-auto">
                  <p className="text-[11px] text-earth-500 font-body">
                    <FaGavel className="w-3 h-3 inline mr-1 text-terracotta" />
                    Searches Supreme Court, Court of Appeal, High Court, and
                    Local Court decisions
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 text-earth-400">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <FaBalanceScale className="w-4 h-4 text-gold animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-copper animate-pulse [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="sticky bottom-0 px-4 sm:px-8 pb-6 pt-4 bg-gradient-to-t from-surface-primary via-surface-primary/95 to-transparent">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
