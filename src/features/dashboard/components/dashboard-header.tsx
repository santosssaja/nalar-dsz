"use client";

import React, { useState } from "react";
import { User, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { AuthModal } from "@/components/ui/auth-modal";

interface DashboardHeaderProps {
  actorKind: "guest" | "member";
  userDisplayName?: string | null;
  userEmail?: string | null;
}

export function DashboardHeader({
  actorKind,
  userDisplayName,
  userEmail,
}: DashboardHeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const displayName = userDisplayName || (userEmail ? userEmail.split("@")[0] : "Pelajar");

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-raised border border-border">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-muted text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Kendali Pemahaman STEM</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
            {actorKind === "member" ? `Selamat Datang, ${displayName}!` : "Dashboard Pemahaman Nalar"}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl">
            Pantau pertumbuhan intuisi sains dan matematika secara menyeluruh. Berfokus pada pemahaman sejati, pengulangan terjadwal, dan pembenahan miskonsepsi.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {actorKind === "member" ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-xs">
              <span className="w-7 h-7 rounded-full bg-accent text-surface-raised flex items-center justify-center font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <div className="text-left">
                <span className="font-semibold text-text block truncate max-w-[150px]">
                  {displayName}
                </span>
                <span className="text-[11px] text-success flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Akun Terverifikasi</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface text-text-muted border border-border">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>Mode Tamu (Lokal)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent text-surface-raised hover:opacity-90 transition-opacity shadow-xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Sinkronkan Akun</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthChange={() => {
          window.location.reload();
        }}
      />
    </>
  );
}
