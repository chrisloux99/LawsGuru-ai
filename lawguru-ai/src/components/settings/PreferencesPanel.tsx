"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "@/components/icons";
import {
  getPreferences,
  savePreferences,
  type Preferences,
} from "@/lib/preferences";

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreferencesPanel({
  isOpen,
  onClose,
}: PreferencesPanelProps) {
  const [prefs, setPrefs] = useState<Preferences>(getPreferences());

  useEffect(() => {
    setPrefs(getPreferences());
  }, [isOpen]);

  const handleFontSizeChange = (size: Preferences["fontSize"]) => {
    const updated = savePreferences({ fontSize: size });
    if (updated) setPrefs(updated);
  };

  const handleThemeChange = (theme: Preferences["theme"]) => {
    const updated = savePreferences({ theme });
    if (updated) setPrefs(updated);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative glass-panel max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-earth-800/50">
          <h3 className="font-heading text-lg font-bold text-earth-100">
            Preferences
          </h3>
          <button
            onClick={onClose}
            className="text-earth-400 hover:text-earth-200 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme */}
          <div>
            <label className="text-sm font-heading font-semibold text-earth-200 mb-3 block">
              Theme
            </label>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-body transition-all ${
                    prefs.theme === theme
                      ? "bg-copper/20 text-copper border border-copper/40"
                      : "bg-earth-900/40 text-earth-400 border border-earth-700 hover:border-earth-600"
                  }`}
                >
                  {theme === "dark" ? "Dark" : "Light"}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-sm font-heading font-semibold text-earth-200 mb-3 block">
              Font Size
            </label>
            <div className="flex gap-2">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-body transition-all ${
                    prefs.fontSize === size
                      ? "bg-copper/20 text-copper border border-copper/40"
                      : "bg-earth-900/40 text-earth-400 border border-earth-700 hover:border-earth-600"
                  }`}
                >
                  {size === "small" ? "Small" : size === "medium" ? "Medium" : "Large"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
