"use client";

import React, { useState, useEffect } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange?: () => void;
}

export function AuthModal({ isOpen, onClose, onAuthChange }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Silakan masukkan alamat email yang valid.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          displayName: displayName.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        const user = json.data.user;
        const mergedCount = json.data.claimResult?.conceptsMerged ?? 0;
        setSuccessMessage(
          `Berhasil masuk sebagai ${user.displayName || user.email}! ${
            mergedCount > 0
              ? `${mergedCount} progres konsep telah digabungkan ke akunmu.`
              : "Progres belajarmu telah disinkronkan."
          }`
        );
        setCurrentUser(user);
        onAuthChange?.();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(json.error?.message ?? "Gagal memproses login.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan koneksi server saat login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setSuccessMessage("Berhasil keluar. Sesi kembali ke Mode Tamu.");
      onAuthChange?.();
      setTimeout(() => {
        onClose();
      }, 1000);
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
                  : "Sinkronkan progres belajarmu tanpa paywall"}
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
          <div className="p-3 rounded-lg bg-danger-muted border border-danger/20 text-danger text-xs">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-lg bg-success-muted border border-success/20 text-success text-xs">
            {successMessage}
          </div>
        )}

        {currentUser ? (
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
                  <span className="text-text-muted">{currentUser.email}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border-subtle flex items-center gap-1.5 text-accent font-medium">
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
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-accent-muted border border-accent/20 space-y-1">
              <span className="font-bold text-accent flex items-center gap-1">
                🔒 Tanpa Kehilangan Progres Tamu
              </span>
              <p className="text-text-muted leading-relaxed">
                Seluruh penguasaan konsep, rekaman latihan, dan review yang telah kamu selesaikan saat mode tamu akan otomatis digabungkan ke akunmu.
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="auth-email" className="font-bold text-text block">
                Alamat Email
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@contoh.com"
                className="w-full p-2.5 rounded-lg bg-surface border border-border text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent text-xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="auth-name" className="font-bold text-text block">
                Nama Panggilan (Opsional)
              </label>
              <input
                id="auth-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="misal: Budi"
                className="w-full p-2.5 rounded-lg bg-surface border border-border text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-medium text-text-muted hover:text-text transition-colors"
              >
                Tetap Mode Tamu
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-xs flex items-center gap-2"
              >
                {isLoading ? "Menghubungkan..." : "Masuk / Buat Akun →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
