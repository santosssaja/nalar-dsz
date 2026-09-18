"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PreferencesModal } from "@/components/ui/preferences-modal";
import { AuthModal } from "@/components/ui/auth-modal";

export function NavHeader() {
  const [isPrefOpen, setIsPrefOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<{
    actorKind: "guest" | "member";
    user: { email: string; displayName: string | null } | null;
  }>({
    actorKind: "guest",
    user: null,
  });

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      const json = await res.json();
      if (json.data) {
        setAuthStatus({
          actorKind: json.data.actorKind,
          user: json.data.user,
        });
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <header className="border-b border-border bg-surface-raised sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-bold text-xl tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent rounded-lg p-1"
            >
              <span className="w-8 h-8 rounded-lg bg-accent text-surface-raised flex items-center justify-center font-bold text-base shadow-xs">
                N
              </span>
              <span className="text-text">Nalar</span>
            </Link>
            <span className="hidden md:inline text-xs text-text-muted border-l border-border pl-3">
              Belajar sampai tahu mengapa
            </span>
          </div>

          {/* Navigation & Controls */}
          <nav className="flex items-center gap-2 sm:gap-4 text-xs font-medium" aria-label="Navigasi Utama">
            <Link
              href="/domains"
              className="text-text-muted hover:text-text px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Kurikulum
            </Link>

            <Link
              href="/modules/turunan"
              className="hidden sm:inline-block text-text-muted hover:text-text px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Kalkulus Turunan
            </Link>

            <Link
              href="/lab"
              className="text-accent font-semibold hover:opacity-80 px-2.5 py-1.5 rounded-lg transition-opacity flex items-center gap-1"
            >
              <span>🔬</span>
              <span className="hidden sm:inline">Nalar Lab</span>
            </Link>

            {/* Accessibility / Preferences Button */}
            <button
              type="button"
              onClick={() => setIsPrefOpen(true)}
              aria-label="Buka pengaturan aksesibilitas dan preferensi tampilan"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-overlay text-text transition-colors shadow-2xs"
            >
              <span className="text-sm">⚙️</span>
              <span className="hidden sm:inline">Aksesibilitas</span>
            </button>

            {/* Auth / Account Button */}
            <div className="border-l border-border pl-2 sm:pl-4 flex items-center">
              {authStatus.actorKind === "member" && authStatus.user ? (
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  aria-label={`Akun pengguna: ${authStatus.user.displayName || authStatus.user.email}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-accent-muted border border-accent/30 text-accent font-semibold hover:opacity-90 transition-opacity"
                >
                  <span className="w-5 h-5 rounded-full bg-accent text-surface-raised flex items-center justify-center text-[10px] font-bold">
                    {(authStatus.user.displayName || authStatus.user.email).charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[100px] truncate text-xs">
                    {authStatus.user.displayName || authStatus.user.email.split("@")[0]}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  aria-label="Masuk atau sinkronkan akun dari mode tamu"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-surface hover:bg-surface-overlay text-text border border-border transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span>Mode Tamu</span>
                  <span className="text-text-muted hidden sm:inline">• Masuk</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Modals */}
      <PreferencesModal
        isOpen={isPrefOpen}
        onClose={() => setIsPrefOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthChange={checkAuth}
      />
    </>
  );
}
