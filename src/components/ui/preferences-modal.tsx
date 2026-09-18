"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Settings, X } from "lucide-react";
import {
  PreferencesPayload,
  FontSizeScale,
  ThemePreference,
  UserPreferences,
} from "@/server/services/preferences-service";

import {
  THEME_STORAGE_KEY,
  CONTRAST_STORAGE_KEY,
  MOTION_STORAGE_KEY,
  FONT_STORAGE_KEY,
  PREFERENCES_EVENT,
  applyPreferencesToDom,
} from "@/components/theme/theme-provider";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "light",
    highContrast: false,
    fontScale: "normal",
    reducedMotion: false,
    naiVisible: true,
    updatedAt: new Date(),
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Only synchronize when the modal is open. When closed (e.g. clicking Selesai), do nothing!
    if (!isOpen) return;

    // 1. Read current local preferences first
    if (typeof window !== "undefined") {
      const localTheme = (localStorage.getItem(THEME_STORAGE_KEY) as UserPreferences["theme"]) || null;
      const localContrast = localStorage.getItem(CONTRAST_STORAGE_KEY);
      const localMotion = localStorage.getItem(MOTION_STORAGE_KEY);
      const localFont = (localStorage.getItem(FONT_STORAGE_KEY) as UserPreferences["fontScale"]) || null;
      setPreferences((prev) => ({
        ...prev,
        theme: localTheme || prev.theme,
        highContrast:
          localContrast !== null
            ? localContrast === "true"
            : (localTheme === "contrast" ? true : prev.highContrast),
        reducedMotion: localMotion !== null ? localMotion === "true" : prev.reducedMotion,
        fontScale: localFont || prev.fontScale,
      }));
    }

    // 2. Fetch server preferences to sync non-local state (e.g. naiVisible)
    let isMounted = true;
    fetch("/api/v1/preferences")
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted || !json.data) return;

        const currentLocalTheme = (localStorage.getItem(THEME_STORAGE_KEY) as UserPreferences["theme"]) || null;
        const currentLocalContrast = localStorage.getItem(CONTRAST_STORAGE_KEY);
        const currentLocalMotion = localStorage.getItem(MOTION_STORAGE_KEY);
        const currentLocalFont = (localStorage.getItem(FONT_STORAGE_KEY) as UserPreferences["fontScale"]) || null;

        // If local preferences were empty, adopt server values
        if (!currentLocalTheme && json.data.theme) {
          localStorage.setItem(THEME_STORAGE_KEY, json.data.theme);
          document.cookie = `nalar_theme=${json.data.theme}; path=/; max-age=31536000; SameSite=Lax`;
        }
        if (currentLocalContrast === null && typeof json.data.highContrast === "boolean") {
          localStorage.setItem(CONTRAST_STORAGE_KEY, String(json.data.highContrast));
          document.cookie = `nalar_high_contrast=${json.data.highContrast}; path=/; max-age=31536000; SameSite=Lax`;
        }
        if (currentLocalMotion === null && typeof json.data.reducedMotion === "boolean") {
          localStorage.setItem(MOTION_STORAGE_KEY, String(json.data.reducedMotion));
        }
        if (!currentLocalFont && json.data.fontScale) {
          localStorage.setItem(FONT_STORAGE_KEY, json.data.fontScale);
        }

        const merged: UserPreferences = {
          ...json.data,
          theme: currentLocalTheme || json.data.theme || "light",
          highContrast:
            currentLocalContrast !== null
              ? currentLocalContrast === "true"
              : Boolean(json.data.highContrast),
          reducedMotion: currentLocalMotion !== null ? currentLocalMotion === "true" : Boolean(json.data.reducedMotion),
          fontScale: currentLocalFont || json.data.fontScale || "normal",
        };

        setPreferences(merged);

        // Only apply to DOM if local was empty and we adopted new server preferences
        if (!currentLocalTheme && json.data.theme) {
          applyPreferencesToDom(merged);
        }
      })
      .catch((err) => console.warn("Could not fetch preferences:", err));

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const updatePreference = async (partial: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...partial };
    setPreferences(updated);
    applyPreferencesToDom(updated);

    // Save locally immediately
    if (typeof window !== "undefined") {
      if (updated.theme) {
        localStorage.setItem(THEME_STORAGE_KEY, updated.theme);
        document.cookie = `nalar_theme=${updated.theme}; path=/; max-age=31536000; SameSite=Lax`;
      }
      if (typeof updated.highContrast === "boolean") {
        localStorage.setItem(CONTRAST_STORAGE_KEY, String(updated.highContrast));
        document.cookie = `nalar_high_contrast=${updated.highContrast}; path=/; max-age=31536000; SameSite=Lax`;
      }
      if (typeof updated.reducedMotion === "boolean") {
        localStorage.setItem(MOTION_STORAGE_KEY, String(updated.reducedMotion));
      }
      if (updated.fontScale) {
        localStorage.setItem(FONT_STORAGE_KEY, updated.fontScale);
      }
      window.dispatchEvent(new Event(PREFERENCES_EVENT));
    }

    setIsSaving(true);
    try {
      await fetch("/api/v1/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
    } catch (err) {
      console.warn("Failed to persist preferences:", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pref-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-raised border border-border p-6 space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent" />
            <div>
              <h3 id="pref-modal-title" className="text-base font-bold text-text">
                Preferensi & Aksesibilitas
              </h3>
              <p className="text-xs text-text-muted">
                Sesuaikan kenyamanan membaca dan belajar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela preferensi"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface border border-transparent hover:border-border transition-colors text-sm font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 text-xs">
          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="font-bold text-text block">Tema Tampilan</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "light", label: "Terang" },
                { id: "dark", label: "Gelap" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updatePreference({ theme: t.id as UserPreferences["theme"] })}
                  className={`py-2 px-3 rounded-lg font-medium border text-center transition-all ${
                    preferences.theme === t.id
                      ? "bg-accent text-surface-raised border-accent shadow-xs"
                      : "bg-surface border-border text-text hover:bg-surface-overlay"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Scaling */}
          <div className="space-y-2">
            <label className="font-bold text-text block">Ukuran Teks</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "small", label: "Ringkas (90%)" },
                { id: "normal", label: "Standar (100%)" },
                { id: "large", label: "Besar (112%)" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => updatePreference({ fontScale: f.id as UserPreferences["fontScale"] })}
                  className={`py-2 px-3 rounded-lg font-medium border text-center transition-all ${
                    preferences.fontScale === f.id
                      ? "bg-accent text-surface-raised border-accent shadow-xs"
                      : "bg-surface border-border text-text hover:bg-surface-overlay"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Toggle (Slide Button) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
            <div className="space-y-0.5 max-w-[260px]">
              <span className="font-bold text-text block">Mode Kontras Tinggi</span>
              <span className="text-[11px] text-text-muted block">
                Pertegas garis batas dan kontras warna teks untuk visibilitas maksimal
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.highContrast}
              onClick={() => updatePreference({ highContrast: !preferences.highContrast })}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                preferences.highContrast ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-surface-raised shadow-xs transform transition-transform ${
                  preferences.highContrast ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
            <div className="space-y-0.5 max-w-[260px]">
              <span className="font-bold text-text block">Kurangi Gerakan (Reduced Motion)</span>
              <span className="text-[11px] text-text-muted block">
                Mematikan animasi simulasi grafik dan transisi non-esensial
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.reducedMotion}
              onClick={() => updatePreference({ reducedMotion: !preferences.reducedMotion })}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                preferences.reducedMotion ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-surface-raised shadow-xs transform transition-transform ${
                  preferences.reducedMotion ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Nai Visibility Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
            <div className="space-y-0.5 max-w-[260px]">
              <span className="font-bold text-text block">Visibilitas Pendamping Nai</span>
              <span className="text-[11px] text-text-muted block">
                Tampilkan saran dan bantuan scaffolding dari asisten Nai
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.naiVisible}
              onClick={() => updatePreference({ naiVisible: !preferences.naiVisible })}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                preferences.naiVisible ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-surface-raised shadow-xs transform transition-transform ${
                  preferences.naiVisible ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[11px] text-text-muted">
            {isSaving ? "Menyimpan preferensi..." : "Preferensi tersimpan otomatis"}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
