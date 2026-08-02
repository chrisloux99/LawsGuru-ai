"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onNewChat?: () => void;
  onFocusSearch?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + N: New chat
      if (isMod && e.key === "n") {
        e.preventDefault();
        handlers.onNewChat?.();
      }

      // Ctrl/Cmd + K: Focus search
      if (isMod && e.key === "k") {
        e.preventDefault();
        handlers.onFocusSearch?.();
      }

      // Escape: Cancel/close
      if (e.key === "Escape") {
        handlers.onEscape?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
