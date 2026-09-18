"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange?: () => void;
}

export function AuthModal({ isOpen, onClose, onAuthChange }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentResult, setSentResult] = useState<{
    email: string;
    mode: "login" | "register";
    devVerificationUrl?: string;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    displayName: string | null;
  } | null>(null);

  const fetchAuthStatus = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      const json = await res.json();
      if (json.data?.user) {
        setCurrentUser(json.data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuthStatus();
      setErrorMessage(null);
      setSentResult(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Silakan masukkan alamat email yang valid.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/auth/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          mode: activeTab,
          displayName: activeTab === "register" ? displayName.trim() || undefined : undefined,
        }),
      });

      const json = await res.json();

      if (res.ok && json.data) {
        setSentResult({
          email: json.data.email,
          mode: json.data.mode,
          devVerificationUrl: json.data.devVerificationUrl,
        });
      } else {
        setErrorMessage(json.error?.message ?? "Gagal mengirimkan tautan verifikasi.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan koneksi server saat mengirim email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setSentResult(null);
      onAuthChange?.();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch {
      setErrorMessage("Gagal keluar dari sesi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-raised border border-border p-6 space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentUser ? "👤" : "🔑"}</span>
            <div>
              <h3 id="auth-modal-title" className="text-base font-bold text-text">
                {currentUser ? "Akun Nalar" : "Masuk atau Buat Akun"}
              </h3>
              <p className="text-xs text-text-muted">
                {currentUser
                  ? "Kelola sesi dan sinkronisasi perangkat"
                  : "Verifikasi sekali klik via Google Gmail"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela akun"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface border border-transparent hover:border-border transition-colors text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-danger-muted border border-danger/20 text-danger text-xs leading-relaxed">
            {errorMessage}
          </div>
        )}

        {currentUser ? (
          /* Logged In View */
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent text-surface-raised flex items-center justify-center font-bold text-base">
                  {(currentUser.displayName || currentUser.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text">
                    {currentUser.displayName || "Pelajar Nalar"}
                  </h4>
                  <span className="text-text-muted font-mono">{currentUser.email}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border flex items-center gap-1.5 text-accent font-medium">
                <span>✓</span>
                <span>Perangkat ini telah terhubung & tersinkronisasi</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-danger hover:bg-danger-muted border border-danger/20 transition-colors"
              >
                {isLoading ? "Memproses..." : "Keluar dari Akun"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-surface border border-border hover:bg-surface-overlay text-text transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : sentResult ? (
          /* Email Sent View */
          <div className="space-y-5 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-accent-muted border border-accent/30 text-accent mx-auto flex items-center justify-center text-3xl">
              📬
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-text">Tautan Masuk Terkirim!</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Kami telah mengirimkan tautan verifikasi sekali klik ke:
              </p>
              <p className="text-xs font-mono font-bold text-accent bg-surface px-3 py-1.5 rounded-lg border border-border inline-block">
                {sentResult.email}
              </p>
              <p className="text-[11px] text-text-muted">
                Buka email Anda dan klik tombol verifikasi untuk langsung masuk tanpa kata sandi.
              </p>
            </div>

            {/* Dev Fallback button */}
            {sentResult.devVerificationUrl && (
              <div className="p-3 rounded-xl bg-surface border border-accent/40 text-left space-y-1.5 text-xs">
                <div className="flex items-center gap-1 font-bold text-accent text-[11px]">
                  <span>⚡</span>
                  <span>Mode Pengujian (Klik Langsung):</span>
                </div>
                <a
                  href={sentResult.devVerificationUrl}
                  className="block p-2 rounded-lg bg-accent text-surface-raised text-center font-semibold text-xs hover:bg-accent-hover transition-colors"
                >
                  Verifikasi Sekali Klik Sekarang →
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setSentResult(null)}
                className="text-text-muted hover:text-text transition-colors"
              >
                ← Ganti Email
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="font-semibold text-accent hover:underline"
              >
                {isLoading ? "Mengirim..." : "Kirim Ulang"}
              </button>
            </div>
          </div>
        ) : (
          /* Tab Switcher & Forms */
          <div className="space-y-4 text-xs">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-surface rounded-xl border border-border">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "login"
                    ? "bg-surface-raised text-accent shadow-xs border border-border"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "register"
                    ? "bg-surface-raised text-accent shadow-xs border border-border"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Daftar (Register)
              </button>
            </div>

            <div className="p-3 rounded-xl bg-accent-muted border border-accent/20 space-y-1">
              <span className="font-bold text-accent flex items-center gap-1">
                🔒 Tanpa Kehilangan Progres Tamu
              </span>
              <p className="text-text-muted leading-relaxed text-[11px]">
                {activeTab === "login"
                  ? "Tautan masuk sekali klik akan dikirim ke Gmail Anda. Tidak perlu mengingat kata sandi."
                  : "Daftar dengan email Anda untuk mengamankan dan menyinkronkan seluruh kemajuan konsepmu."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {activeTab === "register" && (
                <div className="space-y-1">
                  <label htmlFor="modal-auth-name" className="font-bold text-text block">
                    Nama Lengkap / Panggilan
                  </label>
                  <input
                    id="modal-auth-name"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="misal: Budi Santoso"
                    className="w-full p-2.5 rounded-lg bg-surface border border-border text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent text-xs"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="modal-auth-email" className="font-bold text-text block">
                  Alamat Email (Gmail)
                </label>
                <input
                  id="modal-auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full p-2.5 rounded-lg bg-surface border border-border text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Link
                  href="/auth"
                  onClick={onClose}
                  className="text-[11px] text-text-muted hover:text-accent underline"
                >
                  Buka Halaman Penuh ↗
                </Link>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-lg font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-xs flex items-center gap-2"
                >
                  {isLoading
                    ? "Mengirimkan Tautan..."
                    : activeTab === "login"
                    ? "Kirim Tautan Masuk →"
                    : "Daftar & Verifikasi →"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
