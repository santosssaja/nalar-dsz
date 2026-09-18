"use client";

import React, { useState, useEffect } from "react";
import { UserPreferences } from "@/server/services/preferences-service";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "light",
    fontScale: "normal",
    reducedMotion: false,
    naiVisible: true,
    updatedAt: new Date(),
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/v1/preferences")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setPreferences(json.data);
          applyToDom(json.data);
        }
      })
      .catch((err) => console.warn("Could not fetch preferences:", err));
  }, []);

  const applyToDom = (prefs: UserPreferences) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Theme
    root.classList.remove("dark", "high-contrast");
    if (prefs.theme === "dark") {
      root.classList.add("dark");
    } else if (prefs.theme === "contrast") {
      root.classList.add("high-contrast");
    }

    // Reduced Motion
    if (prefs.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    // Font Scale
    root.classList.remove("font-scale-small", "font-scale-large");
    if (prefs.fontScale === "large") {
      root.classList.add("font-scale-large");
    } else if (prefs.fontScale === "small") {
      root.classList.add("font-scale-small");
    }
  };

  const updatePreference = async (partial: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...partial };
    setPreferences(updated);
    applyToDom(updated);

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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pref-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-raised border border-border p-6 space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
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
            ✕
          </button>
        </div>

        <div className="space-y-5 text-xs">
          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="font-bold text-text block">Tema Tampilan</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light", label: "Terang" },
                { id: "dark", label: "Gelap" },
                { id: "contrast", label: "Kontras Tinggi" },
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
    </div>
  );
}
