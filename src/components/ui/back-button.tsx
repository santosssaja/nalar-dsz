"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  fallbackUrl?: string;
}

export function BackButton({
  className = "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border bg-surface-raised hover:border-border-strong text-text hover:text-accent transition-all",
  fallbackUrl = "/",
}: BackButtonProps) {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else if (typeof window !== "undefined") {
      window.location.href = fallbackUrl;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label="Kembali ke halaman sebelumnya"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Kembali</span>
    </button>
  );
}
