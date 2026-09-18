"use client";

import { useEffect } from "react";

export const THEME_STORAGE_KEY = "nalar_theme";
export const CONTRAST_STORAGE_KEY = "nalar_high_contrast";
export const MOTION_STORAGE_KEY = "nalar_reduced_motion";
export const FONT_STORAGE_KEY = "nalar_font_scale";
export const PREFERENCES_EVENT = "nalar_preferences_updated";

export function applyPreferencesToDom(prefs: {
  theme?: string;
  highContrast?: boolean;
  fontScale?: string;
  reducedMotion?: boolean;
}) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Theme: "dark" or "light" (with legacy fallback for "contrast")
  if (prefs.theme) {
    if (prefs.theme === "dark") {
      root.classList.add("dark");
    } else if (prefs.theme === "light") {
      root.classList.remove("dark");
    } else if (prefs.theme === "contrast") {
      root.classList.remove("dark");
      root.classList.add("high-contrast");
    }
  }

  // High Contrast (independent slide button toggle)
  if (typeof prefs.highContrast === "boolean") {
    if (prefs.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }

  // Reduced Motion
  if (typeof prefs.reducedMotion === "boolean") {
    if (prefs.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }
  }

  // Font Scale
  if (prefs.fontScale) {
    root.classList.remove("font-scale-small", "font-scale-large");
    if (prefs.fontScale === "large") {
      root.classList.add("font-scale-large");
    } else if (prefs.fontScale === "small") {
      root.classList.add("font-scale-small");
    }
  }
}

export function ThemeProvider() {
  useEffect(() => {
    // 1. Immediately apply from localStorage on mount (fast client check)
    const localTheme = localStorage.getItem(THEME_STORAGE_KEY) || undefined;
    const localContrast = localStorage.getItem(CONTRAST_STORAGE_KEY);
    const localMotion = localStorage.getItem(MOTION_STORAGE_KEY);
    const localFont = localStorage.getItem(FONT_STORAGE_KEY) || undefined;

    applyPreferencesToDom({
      theme: localTheme,
      highContrast:
        localContrast !== null
          ? localContrast === "true"
          : (localTheme === "contrast" ? true : undefined),
      fontScale: localFont,
      reducedMotion: localMotion !== null ? localMotion === "true" : undefined,
    });

    // 2. Fetch server preferences in background to sync
    fetch("/api/v1/preferences")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          const serverTheme = json.data.theme;
          const serverContrast = json.data.highContrast;
          const serverMotion = json.data.reducedMotion;
          const serverFont = json.data.fontScale;

          const currentLocalTheme = localStorage.getItem(THEME_STORAGE_KEY) || undefined;
          const currentLocalContrast = localStorage.getItem(CONTRAST_STORAGE_KEY);
          const currentLocalMotion = localStorage.getItem(MOTION_STORAGE_KEY);
          const currentLocalFont = localStorage.getItem(FONT_STORAGE_KEY) || undefined;

          // If local storage was empty, adopt server values
          if (!currentLocalTheme && serverTheme) {
            localStorage.setItem(THEME_STORAGE_KEY, serverTheme);
            document.cookie = `nalar_theme=${serverTheme}; path=/; max-age=31536000; SameSite=Lax`;
          }
          if (currentLocalContrast === null && typeof serverContrast === "boolean") {
            localStorage.setItem(CONTRAST_STORAGE_KEY, String(serverContrast));
            document.cookie = `nalar_high_contrast=${serverContrast}; path=/; max-age=31536000; SameSite=Lax`;
          }
          if (currentLocalMotion === null && typeof serverMotion === "boolean") {
            localStorage.setItem(MOTION_STORAGE_KEY, String(serverMotion));
          }
          if (!currentLocalFont && serverFont) {
            localStorage.setItem(FONT_STORAGE_KEY, serverFont);
          }

          applyPreferencesToDom({
            theme: currentLocalTheme || serverTheme,
            highContrast:
              currentLocalContrast !== null
                ? currentLocalContrast === "true"
                : (typeof serverContrast === "boolean" ? serverContrast : undefined),
            reducedMotion:
              currentLocalMotion !== null ? currentLocalMotion === "true" : serverMotion,
            fontScale: currentLocalFont || serverFont,
          });
        }
      })
      .catch(() => {
        // Offline / network failure: localStorage is already applied
      });

    // 3. Listen for custom event when user updates preferences in modal
    const handlePreferencesUpdate = () => {
      const updatedTheme = localStorage.getItem(THEME_STORAGE_KEY) || undefined;
      const updatedContrast = localStorage.getItem(CONTRAST_STORAGE_KEY);
      const updatedMotion = localStorage.getItem(MOTION_STORAGE_KEY);
      const updatedFont = localStorage.getItem(FONT_STORAGE_KEY) || undefined;

      applyPreferencesToDom({
        theme: updatedTheme,
        highContrast: updatedContrast !== null ? updatedContrast === "true" : undefined,
        reducedMotion: updatedMotion !== null ? updatedMotion === "true" : undefined,
        fontScale: updatedFont,
      });
    };

    window.addEventListener(PREFERENCES_EVENT, handlePreferencesUpdate);
    window.addEventListener("storage", handlePreferencesUpdate);

    return () => {
      window.removeEventListener(PREFERENCES_EVENT, handlePreferencesUpdate);
      window.removeEventListener("storage", handlePreferencesUpdate);
    };
  }, []);

  return null;
}
