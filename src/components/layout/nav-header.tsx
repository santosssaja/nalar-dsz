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
        className={`sticky top-1 sm:top-2 z-30 transition-transform duration-300 ease-in-out motion-reduce:transition-none max-w-6xl w-[92%] mx-auto ${
          isVisible || isPrefOpen || isAuthOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 shadow-md rounded-full px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Left: Brand Logo (Tagline Removed) */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              aria-label="Beranda Nalar"
              className="flex items-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1"
            >
              <img
                src="/figma-assets/logo-nalar.png"
                alt="Logo Nalar"
                className="h-8 sm:h-10 w-auto object-contain shrink-0"
              />
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium" aria-label="Navigasi Utama">
            <Link
              href="/dashboard"
              aria-current={isDashboardActive ? "page" : undefined}
              title="Dashboard Belajar"
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all flex items-center gap-1.5 ${
                isDashboardActive
                  ? "font-semibold text-[#1a906b] bg-[#eafff9]"
                  : "text-[#101828] hover:text-[#1a906b] hover:bg-gray-100/70"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/domains"
              aria-current={isCurriculumActive ? "page" : undefined}
              title="Kurikulum Modul"
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all flex items-center gap-1.5 ${
                isCurriculumActive
                  ? "font-semibold text-[#1a906b] bg-[#eafff9]"
                  : "text-[#101828] hover:text-[#1a906b] hover:bg-gray-100/70"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Kurikulum</span>
            </Link>

            <Link
              href="/graph"
              aria-current={isGraphActive ? "page" : undefined}
              title="Peta Graf Konsep (2D)"
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all flex items-center gap-1.5 ${
                isGraphActive
                  ? "font-semibold text-[#1a906b] bg-[#eafff9]"
                  : "text-[#101828] hover:text-[#1a906b] hover:bg-gray-100/70"
              }`}
            >
              <Network className="w-4 h-4 shrink-0" />
              <span>Peta Konsep</span>
            </Link>

            <Link
              href="/lab"
              aria-current={isLabActive ? "page" : undefined}
              title="Nalar Lab (14 Stasiun Eksperimen)"
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all flex items-center gap-1.5 ${
                isLabActive
                  ? "font-semibold text-[#1a906b] bg-[#eafff9]"
                  : "text-[#101828] hover:text-[#1a906b] hover:bg-gray-100/70"
              }`}
            >
              <FlaskConical className="w-4 h-4 shrink-0" />
              <span>Nalar Lab</span>
            </Link>
          </nav>

          {/* Right: Actions (Accessibility & Auth) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Accessibility / Preferences Button */}
            <button
              type="button"
              onClick={() => setIsPrefOpen(true)}
              aria-expanded={isPrefOpen}
              aria-label="Pengaturan Aksesibilitas dan Tampilan"
              title="Pengaturan Aksesibilitas"
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full border text-xs sm:text-sm transition-colors shadow-2xs ${
                isPrefOpen
                  ? "border-[#20b486] bg-[#eafff9] text-[#1a906b] font-semibold"
                  : "border-gray-200 bg-white hover:bg-gray-50 text-[#101828]"
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
                className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-full bg-[#20b486] text-white text-xs sm:text-sm font-semibold shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05),0px_0px_0px_4px_#f4ebff] hover:bg-[#1a906b] transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-white text-[#20b486] flex items-center justify-center text-xs font-bold shrink-0">
                  {(authStatus.user.displayName || authStatus.user.email).charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[90px] md:max-w-[120px] truncate text-xs font-semibold">
                  {authStatus.user.displayName || authStatus.user.email.split("@")[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                aria-label="Masuk atau sinkronkan akun dari mode tamu"
                title="Mode Tamu / Masuk Akun"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#20b486] border border-[#20b486] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05),0px_0px_0px_4px_#f4ebff] hover:bg-[#1a906b] transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                <span className="hidden sm:inline">Mode Tamu • </span>
                <span>Masuk Akun</span>
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
