"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const initialStatus = searchParams.get("status");
  const email = searchParams.get("email");
  const errorMessageParam = searchParams.get("message");

  const [state, setState] = useState<"loading" | "success" | "error">(
    initialStatus === "success"
      ? "success"
      : initialStatus === "error"
      ? "error"
      : token
      ? "loading"
      : "error"
  );
  const [message, setMessage] = useState<string>(
    errorMessageParam || "Tautan verifikasi tidak ditemukan."
  );
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(email);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (initialStatus === "success") {
      setState("success");
      return;
    }

    if (token && state === "loading") {
      fetch(`/api/v1/auth/verify?token=${encodeURIComponent(token)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data?.user) {
            setState("success");
            setVerifiedEmail(json.data.user.email);
          } else {
            setState("error");
            setMessage(json.error?.message || "Verifikasi token gagal.");
          }
        })
        .catch(() => {
          setState("error");
          setMessage("Terjadi kesalahan jaringan saat memverifikasi token.");
        });
    }
  }, [token, initialStatus, state]);

  // Auto redirect on success
  useEffect(() => {
    if (state === "success") {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            router.push("/modules/turunan");
            return 0;
          }
          return c - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state, router]);

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
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
      </div>

      <div className="bg-surface-raised border border-border rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6">
        {state === "loading" && (
          <div className="space-y-4 py-6">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-text">Memverifikasi Tautan...</h2>
              <p className="text-xs text-text-muted">
                Mohon tunggu sejenak, kami sedang menghubungkan sesi akunmu.
              </p>
            </div>
          </div>
        )}

        {state === "success" && (
          <div className="space-y-5 py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-success-muted text-success border border-success/30 mx-auto flex items-center justify-center shadow-xs">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-text">Verifikasi Email Berhasil!</h2>
              <p className="text-xs text-text-muted leading-relaxed">
                Kamu telah berhasil masuk ke akun Nalar. Seluruh progres belajar dan preferensimu kini telah tersinkronkan.
              </p>
              {verifiedEmail && (
                <span className="inline-block px-3 py-1 rounded-lg bg-surface border border-border font-mono text-xs font-bold text-accent">
                  {verifiedEmail}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-accent-muted border border-accent/20 text-xs text-accent">
              <span>Mengalihkan otomatis ke modul belajar dalam </span>
              <span className="font-bold font-mono">{countdown} detik...</span>
            </div>

            <div className="pt-2">
              <Link
                href="/modules/turunan"
                className="w-full py-2.5 px-4 rounded-xl font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors text-xs inline-block text-center shadow-xs"
              >
                Mulai Belajar Sekarang →
              </Link>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-5 py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-danger-muted text-danger border border-danger/30 mx-auto flex items-center justify-center">
              <X className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-text">Verifikasi Gagal</h2>
              <p className="text-xs text-danger bg-danger-muted/50 p-3 rounded-xl border border-danger/20 leading-relaxed">
                {message}
              </p>
              <p className="text-[11px] text-text-muted">
                Tautan verifikasi mungkin telah kedaluwarsa (lebih dari 15 menit) atau sudah pernah digunakan sebelumnya.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/auth"
                className="w-full py-2.5 px-4 rounded-xl font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors text-xs inline-block text-center shadow-xs"
              >
                Kirim Ulang Tautan Baru →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-12 text-center text-xs text-text-muted">
          Memuat verifikasi...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
