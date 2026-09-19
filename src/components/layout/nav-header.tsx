"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Network, FlaskConical, Settings, BookOpen } from "lucide-react";
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

  const isDashboardActive =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isCurriculumActive =
    pathname === "/domains" ||
    pathname.startsWith("/domains/") ||
    pathname.startsWith("/modules") ||
    pathname.startsWith("/learn");
  const isGraphActive = pathname === "/graph" || pathname.startsWith("/graph/");
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
      <header className="border-b border-border bg-surface-raised relative z-30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/"
              aria-label="Beranda Nalar"
              className="font-bold text-lg sm:text-xl tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent rounded-lg p-1"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent text-surface-raised flex items-center justify-center font-bold text-sm sm:text-base shadow-xs">
                N
              </span>
              <span className="text-text">Nalar</span>
            </Link>
            <span className="hidden md:inline text-xs text-text-muted border-l border-border pl-3">
              Belajar sampai tahu mengapa
            </span>
          </div>

          {/* Navigation & Controls */}
          <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium" aria-label="Navigasi Utama">
            <Link
              href="/dashboard"
              aria-current={isDashboardActive ? "page" : undefined}
              title="Dashboard Belajar"
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isDashboardActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface border border-transparent"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>

            <Link
              href="/domains"
              aria-current={isCurriculumActive ? "page" : undefined}
              title="Kurikulum Modul"
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isCurriculumActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface border border-transparent"
              }`}
            >
              <BookOpen className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden md:inline">Kurikulum</span>
            </Link>

            <Link
              href="/graph"
              aria-current={isGraphActive ? "page" : undefined}
              title="Peta Graf Konsep (2D)"
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isGraphActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface border border-transparent"
              }`}
            >
              <Network className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden lg:inline">Peta Konsep</span>
            </Link>

            <Link
              href="/lab"
              aria-current={isLabActive ? "page" : undefined}
              title="Nalar Lab (14 Stasiun Eksperimen)"
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isLabActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface border border-transparent"
              }`}
            >
              <FlaskConical className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden lg:inline">Nalar Lab</span>
            </Link>

            {/* Accessibility / Preferences Button */}
            <button
              type="button"
              onClick={() => setIsPrefOpen(true)}
              aria-expanded={isPrefOpen}
              aria-label="Pengaturan Aksesibilitas dan Tampilan"
              title="Pengaturan Aksesibilitas"
              className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg border transition-colors shadow-2xs ${
                isPrefOpen
                  ? "border-accent/40 bg-accent-muted text-accent font-semibold"
                  : "border-border bg-surface hover:bg-surface-overlay text-text"
              }`}
            >
              <Settings className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden lg:inline">Aksesibilitas</span>
            </button>

            {/* Auth / Account Button */}
            <div className="border-l border-border pl-1.5 sm:pl-3 flex items-center shrink-0">
              {authStatus.actorKind === "member" && authStatus.user ? (
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  aria-label={`Akun pengguna: ${authStatus.user.displayName || authStatus.user.email}`}
                  title={authStatus.user.displayName || authStatus.user.email}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1.5 rounded-lg bg-accent-muted border border-accent/30 text-accent font-semibold hover:opacity-90 transition-opacity"
                >
                  <span className="w-5 h-5 rounded-full bg-accent text-surface-raised flex items-center justify-center text-[10px] font-bold shrink-0">
                    {(authStatus.user.displayName || authStatus.user.email).charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline max-w-[80px] md:max-w-[100px] truncate text-xs">
                    {authStatus.user.displayName || authStatus.user.email.split("@")[0]}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  aria-label="Masuk atau sinkronkan akun dari mode tamu"
                  title="Mode Tamu / Masuk Akun"
                  className={`inline-flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isAuthActive || isAuthOpen
                      ? "bg-accent-muted text-accent border border-accent/40 shadow-xs"
                      : "bg-surface hover:bg-surface-overlay text-text border border-border"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                  <span className="hidden sm:inline">Mode Tamu • </span>
                  <span>Masuk</span>
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
