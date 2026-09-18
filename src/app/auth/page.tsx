"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck, Check, Zap } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
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

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.user) {
          setCurrentUser(json.data.user);
        }
      })
      .catch(() => {});
  }, []);

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
      setErrorMessage("Terjadi gangguan koneksi server. Silakan coba lagi.");
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
      router.refresh();
    } catch {
      setErrorMessage("Gagal keluar dari akun.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-text hover:opacity-90 transition-opacity"
        >
          <span className="w-10 h-10 rounded-xl bg-accent text-surface-raised flex items-center justify-center font-bold text-xl shadow-xs">
            N
          </span>
          <span>Nalar</span>
        </Link>
        <p className="text-xs text-text-muted">
          Belajar sampai tahu mengapa — Masuk sekali klik tanpa kata sandi
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-surface-raised border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {currentUser ? (
          /* Logged-in State */
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-accent text-surface-raised mx-auto flex items-center justify-center text-2xl font-bold shadow-md">
              {(currentUser.displayName || currentUser.email).charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-text">
                {currentUser.displayName || "Pelajar Nalar"}
              </h2>
              <p className="text-xs text-text-muted font-mono">{currentUser.email}</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-muted text-success mt-2">
                <Check className="w-3.5 h-3.5" />
                <span>Akun Terverifikasi & Tersinkronkan</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col gap-2.5">
              <Link
                href="/modules/turunan"
                className="w-full py-2.5 px-4 rounded-xl font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors text-xs text-center shadow-xs"
              >
                Lanjutkan Belajar →
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-danger hover:bg-danger-muted border border-danger/20 transition-colors text-xs"
              >
                {isLoading ? "Memproses..." : "Keluar dari Akun"}
              </button>
            </div>
          </div>
        ) : sentResult ? (
          /* Email Sent Success State */
          <div className="space-y-6 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-accent-muted border border-accent/30 text-accent mx-auto flex items-center justify-center">
              <Mail className="w-8 h-8 text-accent" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-text">Periksa Kotak Masuk Anda!</h2>
              <p className="text-xs text-text-muted leading-relaxed">
                Kami telah mengirimkan tautan verifikasi masuk sekali klik ke:
              </p>
              <p className="text-xs font-mono font-bold text-accent bg-surface px-3 py-1.5 rounded-lg border border-border inline-block">
                {sentResult.email}
              </p>
              <p className="text-[11px] text-text-muted mt-2">
                Cukup buka email Anda dan <strong>klik tautan</strong> tersebut untuk langsung masuk. Tautan berlaku selama 15 menit.
              </p>
            </div>

            {/* Dev Fallback Button if running locally without active SMTP */}
            {sentResult.devVerificationUrl && (
              <div className="p-3.5 rounded-xl bg-surface border border-accent/40 text-left space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-accent text-[11px]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Tautan Langsung (Mode Pengujian / Dev):</span>
                </div>
                <a
                  href={sentResult.devVerificationUrl}
                  className="block p-2 rounded-lg bg-accent text-surface-raised text-center font-semibold text-xs hover:bg-accent-hover transition-colors"
                >
                  Klik untuk Verifikasi Langsung →
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
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
                {isLoading ? "Mengirim..." : "Kirim Ulang Email"}
              </button>
            </div>
          </div>
        ) : (
          /* Tab Switcher & Forms */
          <div className="space-y-5">
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

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-danger-muted border border-danger/20 text-danger text-xs leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Info Banner */}
            <div className="p-3.5 rounded-xl bg-accent-muted border border-accent/20 space-y-1 text-xs">
              <span className="font-bold text-accent flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>{activeTab === "login" ? "Masuk Sekali Klik" : "Daftar Tanpa Ribet"}</span>
              </span>
              <p className="text-text-muted leading-relaxed text-[11px]">
                {activeTab === "login"
                  ? "Masukkan email akunmu. Kami akan mengirimkan tautan verifikasi langsung ke Gmail Anda untuk login tanpa password."
                  : "Buat akun baru untuk mengamankan riwayat belajar. Seluruh progres selama Mode Tamu akan otomatis digabungkan."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {activeTab === "register" && (
                <div className="space-y-1.5">
                  <label htmlFor="reg-name" className="font-bold text-text block">
                    Nama Lengkap / Panggilan
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="misal: Budi Santoso"
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent text-xs"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="font-bold text-text block">
                  Alamat Email (Gmail / Lainnya)
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full p-2.5 rounded-xl bg-surface border border-border text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                {isLoading
                  ? "Mengirimkan Tautan..."
                  : activeTab === "login"
                  ? "Kirim Tautan Masuk Sekali Klik →"
                  : "Daftar & Kirim Tautan Verifikasi →"}
              </button>
            </form>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <Link href="/" className="hover:underline">
            ← Kembali ke Beranda
          </Link>
          <Link href="/modules/turunan" className="hover:underline text-accent font-medium">
            Lanjut Mode Tamu →
          </Link>
        </div>
      </div>
    </div>
  );
}
