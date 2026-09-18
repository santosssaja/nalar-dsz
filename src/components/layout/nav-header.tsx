"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PreferencesModal } from "@/components/ui/preferences-modal";
import { AuthModal } from "@/components/ui/auth-modal";

export function NavHeader() {
  const pathname = usePathname();
  const [isPrefOpen, setIsPrefOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<{
    actorKind: "guest" | "member";
    user: { email: string; displayName: string | null } | null;
  }>({
    actorKind: "guest",
    user: null,
  });

  const isDomainsActive = pathname === "/domains" || pathname.startsWith("/domains/");
  const isModulesActive = pathname.startsWith("/modules") || pathname.startsWith("/learn");
  const isLabActive = pathname === "/lab" || pathname.startsWith("/lab/");
  const isAuthActive = pathname === "/auth" || pathname.startsWith("/auth/");

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
          <nav className="flex items-center gap-1.5 sm:gap-3 text-xs font-medium" aria-label="Navigasi Utama">
            <Link
              href="/domains"
              aria-current={isDomainsActive ? "page" : undefined}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isDomainsActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface border border-transparent"
              }`}
            >
              Kurikulum
            </Link>

            <Link
              href="/modules/turunan"
              aria-current={isModulesActive ? "page" : undefined}
              className={`hidden sm:inline-block px-3 py-1.5 rounded-lg transition-all ${
                isModulesActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface border border-transparent"
              }`}
            >
              Kalkulus Turunan
            </Link>

            <Link
              href="/lab"
              aria-current={isLabActive ? "page" : undefined}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isLabActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface border border-transparent"
              }`}
            >
              <span>🔬</span>
              <span className="hidden sm:inline">Nalar Lab</span>
            </Link>

            {/* Accessibility / Preferences Button */}
            <button
              type="button"
              onClick={() => setIsPrefOpen(true)}
              aria-expanded={isPrefOpen}
              aria-label="Buka pengaturan aksesibilitas dan preferensi tampilan"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors shadow-2xs ${
                isPrefOpen
                  ? "border-accent/40 bg-accent-muted text-accent font-semibold"
                  : "border-border bg-surface hover:bg-surface-overlay text-text"
              }`}
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isAuthActive || isAuthOpen
                      ? "bg-accent-muted text-accent border border-accent/40 shadow-xs"
                      : "bg-surface hover:bg-surface-overlay text-text border border-border"
                  }`}
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
