"use client";

const PREFS_KEY = "lawguru-preferences";

export interface Preferences {
  fontSize: "small" | "medium" | "large";
  theme: "dark" | "light";
}

const defaultPrefs: Preferences = {
  fontSize: "medium",
  theme: "dark",
};

export function getPreferences(): Preferences {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPrefs;
    return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    return defaultPrefs;
  }
}

export function savePreferences(prefs: Partial<Preferences>) {
  if (typeof window === "undefined") return;
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  applyPreferences(updated);
  return updated;
}

export function applyPreferences(prefs: Preferences) {
  if (typeof window === "undefined") return;

  // Apply font size
  const sizes = { small: "14px", medium: "16px", large: "18px" };
  document.documentElement.style.setProperty(
    "--base-font-size",
    sizes[prefs.fontSize]
  );

  // Apply theme
  document.documentElement.setAttribute("data-theme", prefs.theme);
}
