"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Network, FlaskConical, Settings, BookOpen } from "lucide-react";
import Image from "next/image";
import { PreferencesModal } from "@/components/ui/preferences-modal";
import { AuthModal } from "@/components/ui/auth-modal";

export function NavHeader() {
  const pathname = usePathname();
  const [isPrefOpen, setIsPrefOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Smart Auto-Hide: Hide when scrolling down, show when scrolling up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;

      // Always show at the top of the page
      if (currentScrollY <= 20) {
        setIsVisible(true);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
        // Only trigger hide/show if threshold exceeded (prevents micro-jitter)
        if (Math.abs(scrollDiff) > 8) {
          if (scrollDiff > 0) {
            // Scrolling down -> hide header to maximize learning focus
            setIsVisible(false);
          } else {
            // Scrolling up -> reveal header for instant navigation
            setIsVisible(true);
          }
        }
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        onFocusCapture={() => setIsVisible(true)}
        className={`sticky top-2 z-30 transition-transform duration-300 ease-in-out motion-reduce:transition-none max-w-6xl w-[94%] sm:w-full mx-auto ${
          isVisible || isPrefOpen || isAuthOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-surface/85 backdrop-blur-md border border-border shadow-md rounded-full px-3.5 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              aria-label="Beranda Nalar"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1"
            >
              <Image
                src="/figma-assets/logo-nalar.webp"
                alt="Logo Nalar"
                width={36}
                height={36}
                priority
                className="h-8 sm:h-9 w-auto object-contain shrink-0"
              />
              <span className="hidden sm:inline font-bold text-base sm:text-lg text-text tracking-tight">
                Nalar
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium" aria-label="Navigasi Utama">
            <Link
              href="/dashboard"
              aria-current={isDashboardActive ? "page" : undefined}
              title="Dashboard Belajar"
              className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all flex items-center gap-1.5 ${
                isDashboardActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface-overlay border border-transparent"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>

            <Link
              href="/domains"
              aria-current={isCurriculumActive ? "page" : undefined}
              title="Kurikulum Modul"
              className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all flex items-center gap-1.5 ${
                isCurriculumActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface-overlay border border-transparent"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Kurikulum</span>
            </Link>

            <Link
              href="/graph"
              aria-current={isGraphActive ? "page" : undefined}
              title="Peta Graf Konsep (2D)"
              className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all flex items-center gap-1.5 ${
                isGraphActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface-overlay border border-transparent"
              }`}
            >
              <Network className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Peta Konsep</span>
            </Link>

            <Link
              href="/lab"
              aria-current={isLabActive ? "page" : undefined}
              title="Nalar Lab (14 Stasiun Eksperimen)"
              className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all flex items-center gap-1.5 ${
                isLabActive
                  ? "font-semibold bg-accent-muted text-accent border border-accent/30 shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface-overlay border border-transparent"
              }`}
            >
              <FlaskConical className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Nalar Lab</span>
            </Link>
          </nav>

          {/* Right: Actions (Accessibility & Auth) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Accessibility / Preferences Button */}
            <button
              type="button"
              onClick={() => setIsPrefOpen(true)}
              aria-expanded={isPrefOpen}
              aria-label="Pengaturan Aksesibilitas dan Tampilan"
              title="Pengaturan Aksesibilitas"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border text-xs sm:text-sm transition-colors shadow-2xs ${
                isPrefOpen
                  ? "border-accent/40 bg-accent-muted text-accent font-semibold"
                  : "border-border bg-surface hover:bg-surface-overlay text-text"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="hidden xl:inline">Aksesibilitas</span>
            </button>

            {/* Auth / Account Button */}
            {authStatus.actorKind === "member" && authStatus.user ? (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                aria-label={`Akun pengguna: ${authStatus.user.displayName || authStatus.user.email}`}
                title={authStatus.user.displayName || authStatus.user.email}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-accent text-surface-raised text-xs sm:text-sm font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
              >
                <span className="w-5 h-5 rounded-full bg-surface-raised text-accent flex items-center justify-center text-xs font-bold shrink-0">
                  {(authStatus.user.displayName || authStatus.user.email).charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[80px] md:max-w-[110px] truncate text-xs font-semibold">
                  {authStatus.user.displayName || authStatus.user.email.split("@")[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                aria-label="Masuk atau sinkronkan akun dari mode tamu"
                title="Mode Tamu / Masuk Akun"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-surface-raised bg-accent border border-accent shadow-xs hover:bg-accent-hover transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-surface-raised animate-pulse shrink-0" />
                <span className="hidden sm:inline">Mode Tamu • </span>
                <span>Masuk</span>
              </button>
            )}
          </div>
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
