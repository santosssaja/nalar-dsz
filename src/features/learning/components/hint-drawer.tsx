"use client";

import React, { useState } from "react";
import { HintLayer, HintLevel } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";

interface HintDrawerProps {
  hints?: HintLayer;
  stepId: string;
  onHintRequested?: (level: HintLevel, count: number) => void;
}

const HINT_LEVEL_LABELS: Record<HintLevel, { title: string; desc: string }> = {
  orientation: {
    title: "1. Orientasi (Melihat Fakta)",
    desc: "Membantu menyorot data atau fakta penting dalam permasalahan.",
  },
  concept: {
    title: "2. Konsep (Pengingat Materi)",
    desc: "Mengingatkan kembali konsep matematika yang mendasari soal.",
  },
  strategy: {
    title: "3. Strategi (Arah Langkah)",
    desc: "Memberi petunjuk jalan keluar tanpa menghitung nilai akhir.",
  },
  solution: {
    title: "4. Solusi Lengkap",
    desc: "Menjelaskan penyelesaian menyeluruh dari awal hingga akhir.",
  },
};

export function HintDrawer({ hints, onHintRequested }: HintDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unlockedLevels, setUnlockedLevels] = useState<HintLevel[]>([]);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);

  if (!hints) return null;

  const availableLevels: HintLevel[] = [
    hints.orientation ? "orientation" : null,
    hints.concept ? "concept" : null,
    hints.strategy ? "strategy" : null,
    hints.solution ? "solution" : null,
  ].filter(Boolean) as HintLevel[];

  const handleUnlockNext = (level: HintLevel) => {
    if (level === "solution" && !showSolutionConfirm) {
      setShowSolutionConfirm(true);
      return;
    }

    if (!unlockedLevels.includes(level)) {
      const nextUnlocked = [...unlockedLevels, level];
      setUnlockedLevels(nextUnlocked);
      setShowSolutionConfirm(false);
      onHintRequested?.(level, nextUnlocked.length);
    }
  };

  const nextToUnlock = availableLevels.find((lvl) => !unlockedLevels.includes(lvl));

  return (
    <div className="mt-6 border border-border rounded-xl bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left text-sm font-semibold text-text hover:bg-surface-raised transition-colors focus-visible:ring-2 focus-visible:ring-accent"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
            ?
          </span>
          <span>Butuh Bantuan? (Adaptive Hints)</span>
        </span>
        <span className="text-xs text-text-muted font-mono">
          {unlockedLevels.length} / {availableLevels.length} Terbuka {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-border space-y-4 bg-surface-raised">
          <p className="text-xs text-text-muted leading-relaxed">
            Hint diatur berlapis dari petunjuk ringan hingga penjelasan lengkap. Menggunakan lebih sedikit hint membuktikan kemandirian belajarmu!
          </p>

          <div className="space-y-3">
            {availableLevels.map((lvl) => {
              const isUnlocked = unlockedLevels.includes(lvl);
              const meta = HINT_LEVEL_LABELS[lvl];
              const hintContent = hints[lvl];

              return (
                <div
                  key={lvl}
                  className={`p-4 rounded-lg border transition-all ${
                    isUnlocked
                      ? "border-accent/30 bg-accent-muted/20"
                      : "border-border-subtle bg-surface opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-xs text-text">{meta.title}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded text-text-muted bg-surface border border-border">
                      {isUnlocked ? "Terbuka" : "Terkunci"}
                    </span>
                  </div>

                  {isUnlocked ? (
                    <div className="text-xs text-text mt-2 font-normal">
                      <MathRenderer content={hintContent || ""} />
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted italic">{meta.desc}</p>
                  )}
                </div>
              );
            })}
          </div>

          {showSolutionConfirm && (
            <div className="p-4 rounded-lg bg-warning-muted border border-warning/30 space-y-2">
              <p className="text-xs font-semibold text-text">
                Buka Solusi Lengkap?
              </p>
              <p className="text-xs text-text-muted">
                Membuka solusi langsung akan mengurangi skor bukti kemandirian pada dimensi practice.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleUnlockNext("solution")}
                  className="px-3 py-1.5 rounded text-xs font-medium bg-accent text-surface-raised hover:bg-accent-hover"
                >
                  Ya, Buka Solusi
                </button>
                <button
                  type="button"
                  onClick={() => setShowSolutionConfirm(false)}
                  className="px-3 py-1.5 rounded text-xs font-medium border border-border hover:bg-surface text-text"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {nextToUnlock && !showSolutionConfirm && (
            <button
              type="button"
              onClick={() => handleUnlockNext(nextToUnlock)}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-medium bg-surface border border-border hover:bg-surface-overlay text-text transition-colors flex items-center justify-center gap-2"
            >
              <span>Buka Petunjuk: {HINT_LEVEL_LABELS[nextToUnlock].title}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
