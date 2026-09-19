"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, LayoutDashboard } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error securely without exposing sensitive database or internal reasoning details
    console.error("Application error boundary triggered:", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="py-12 sm:py-16 space-y-8 max-w-xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-danger-muted text-danger border border-danger/20 shadow-2xs">
        <AlertCircle className="w-4 h-4" />
        <span>Terjadi Kendala Memuat Konten</span>
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
          Sistem Menemui Kendala Sementara
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Terjadi kesalahan saat memproses permintaan ini. Data pembelajaran lokal Anda tetap aman.
          Silakan coba muat ulang komponen ini atau kembali ke dashboard.
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono text-text-subtle">
            Kode Referensi: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-accent text-white hover:bg-accent-hover transition-all shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Coba Lagi</span>
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border bg-surface-raised hover:border-accent text-text hover:text-accent transition-all shadow-2xs"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Belajar</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border bg-surface hover:bg-surface-raised text-text-muted hover:text-text transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Beranda</span>
        </Link>
      </div>
    </div>
  );
}
