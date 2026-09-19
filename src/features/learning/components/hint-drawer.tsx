"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { HintLayer, HintLevel } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";

interface HintDrawerProps {
  hints?: HintLayer;
  stepId: string;
  onHintRequested?: (level: HintLevel, count: number) => void;
}

const HINT_COOLDOWN_SECONDS = 8;

const HINT_METADATA: Record<
  HintLevel,
  { number: number; name: string; title: string; desc: string }
> = {
  orientation: {
    number: 1,
    name: "Orientasi",
    title: "1. Orientasi (Melihat Fakta)",
    desc: "Menyorot data atau fakta penting dalam permasalahan.",
  },
  concept: {
    number: 2,
    name: "Konsep",
    title: "2. Konsep (Pengingat Materi)",
    desc: "Mengingatkan kembali konsep dasar yang mendasari soal.",
  },
  strategy: {
    number: 3,
    name: "Strategi",
    title: "3. Strategi (Arah Langkah)",
    desc: "Petunjuk metode langkah penyelesaian tanpa membocorkan jawaban.",
  },
  solution: {
    number: 4,
    name: "Solusi Lengkap",
    title: "4. Solusi Lengkap",
    desc: "Penjelasan matematis menyeluruh dari awal hingga akhir.",
  },
};

export function HintDrawer({
  hints,
  stepId,
  onHintRequested,
}: HintDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unlockedLevels, setUnlockedLevels] = useState<HintLevel[]>([]);
  const [viewingIndex, setViewingIndex] = useState<number>(0);
  const [cooldown, setCooldown] = useState<number>(0);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState<boolean>(false);

  // Reset state when stepId changes
  useEffect(() => {
    setUnlockedLevels([]);
    setViewingIndex(0);
    setCooldown(0);
    setShowSolutionConfirm(false);
    setIsOpen(false);
  }, [stepId]);

  // Cooldown countdown interval
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  if (!hints) return null;

  const availableLevels: HintLevel[] = [
    hints.orientation ? "orientation" : null,
    hints.concept ? "concept" : null,
    hints.strategy ? "strategy" : null,
    hints.solution ? "solution" : null,
  ].filter(Boolean) as HintLevel[];

  if (availableLevels.length === 0) return null;

  const handleUnlockNext = (level: HintLevel) => {
    if (level === "solution" && !showSolutionConfirm) {
      setShowSolutionConfirm(true);
      return;
    }

    if (!unlockedLevels.includes(level)) {
      const nextUnlocked = [...unlockedLevels, level];
      setUnlockedLevels(nextUnlocked);
      // Auto-overwrite the displayed view to the newly unlocked hint
      setViewingIndex(nextUnlocked.length - 1);
      setShowSolutionConfirm(false);
      setCooldown(HINT_COOLDOWN_SECONDS);
      setIsOpen(true);
      onHintRequested?.(level, nextUnlocked.length);
    }
  };

  const nextToUnlock = availableLevels.find((lvl) => !unlockedLevels.includes(lvl));
  const currentLevel = unlockedLevels[viewingIndex];
  const currentHintText = currentLevel ? hints[currentLevel] : null;
  const currentMeta = currentLevel ? HINT_METADATA[currentLevel] : null;

  // Unopened trigger state when no hints have been unlocked yet
  if (unlockedLevels.length === 0) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (availableLevels[0]) {
              handleUnlockNext(availableLevels[0]);
            }
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-accent/30 bg-accent-muted/40 hover:bg-accent-muted text-accent text-xs font-semibold transition-all shadow-2xs hover:shadow-xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-accent" />
          <span>Butuh Bantuan? Buka Petunjuk Bertingkat (Adaptive Hints)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 border border-border rounded-xl bg-surface-raised overflow-hidden shadow-xs">
      {/* Top Single Header Row */}
      <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-md bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Lightbulb className="w-3.5 h-3.5" />
          </span>
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-text">
              Petunjuk {viewingIndex + 1}/{unlockedLevels.length}:
            </span>
            <span className="text-accent font-semibold truncate">
              {currentMeta?.name}
            </span>
          </div>
        </div>

        {/* Level Pager / Stepper Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Level Pills: Allows jumping directly to previously unlocked hints */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            {availableLevels.map((lvl, idx) => {
              const isUnlocked = unlockedLevels.includes(lvl);
              const isViewing = unlockedLevels[viewingIndex] === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => {
                    const foundIndex = unlockedLevels.indexOf(lvl);
                    if (foundIndex !== -1) setViewingIndex(foundIndex);
                  }}
                  title={HINT_METADATA[lvl].title}
                  className={`w-6 h-6 rounded-md text-[11px] font-bold font-mono transition-all flex items-center justify-center ${
                    isViewing
                      ? "bg-accent text-surface-raised shadow-xs ring-1 ring-accent"
                      : isUnlocked
                      ? "bg-surface-raised border border-border text-text hover:bg-accent-muted hover:text-accent"
                      : "bg-surface text-text-muted/40 border border-border-subtle cursor-not-allowed"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={viewingIndex <= 0}
            onClick={() => setViewingIndex((prev) => Math.max(0, prev - 1))}
            aria-label="Lihat hint sebelumnya"
            title="Lihat hint sebelumnya"
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised disabled:opacity-40 disabled:hover:bg-surface text-text transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-mono font-bold text-text px-1">
            {viewingIndex + 1}/{unlockedLevels.length}
          </span>

          <button
            type="button"
            disabled={viewingIndex >= unlockedLevels.length - 1}
            onClick={() =>
              setViewingIndex((prev) =>
                Math.min(unlockedLevels.length - 1, prev + 1)
              )
            }
            aria-label="Lihat hint selanjutnya"
            title="Lihat hint selanjutnya"
            className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-raised disabled:opacity-40 disabled:hover:bg-surface text-text transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Sembunyikan isi hint" : "Tampilkan isi hint"}
            className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-muted hover:text-text transition-colors ml-1"
          >
            {isOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          {/* Active Hint Content (Single Container - Replaced dynamically) */}
          <div
            role="region"
            aria-live="polite"
            aria-label="Isi petunjuk aktif"
            className="p-4 text-xs text-text leading-relaxed"
          >
            {currentHintText ? (
              <MathRenderer content={currentHintText} />
            ) : (
              <span className="text-text-muted italic">Tidak ada konten petunjuk.</span>
            )}
          </div>

          {/* Bottom Action / Cooldown / Solution Confirmation Bar */}
          <div className="px-4 py-2.5 bg-surface border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            {showSolutionConfirm ? (
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-warning-muted/40 p-2.5 rounded-lg border border-warning/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <span className="text-[11px] text-text font-medium">
                    Membuka solusi langsung akan mengurangi skor bukti kemandirian. Yakin?
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUnlockNext("solution")}
                    className="px-2.5 py-1 rounded text-xs font-semibold bg-warning text-surface-raised hover:opacity-90"
                  >
                    Ya, Buka Solusi
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSolutionConfirm(false)}
                    className="px-2.5 py-1 rounded text-xs font-medium border border-border bg-surface hover:bg-surface-raised text-text"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : nextToUnlock ? (
              <>
                <div className="flex items-center gap-2 text-[11px] text-text-muted">
                  {cooldown > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-accent font-medium">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>
                        Pikirkan petunjuk ini ({cooldown}d) sebelum membuka tingkat berikutnya...
                      </span>
                    </span>
                  ) : (
                    <span>
                      Tersedia: {HINT_METADATA[nextToUnlock].title}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={() => handleUnlockNext(nextToUnlock)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs self-end sm:self-auto disabled:opacity-40 disabled:cursor-not-allowed bg-accent text-surface-raised hover:bg-accent-hover"
                >
                  {cooldown > 0 ? (
                    <>
                      <Clock className="w-3 h-3" />
                      <span>Tunggu {cooldown}s</span>
                    </>
                  ) : (
                    <>
                      <span>Buka Hint {unlockedLevels.length + 1}: {HINT_METADATA[nextToUnlock].name}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between text-text-muted text-[11px]">
                <span className="flex items-center gap-1 text-success font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-success" />
                  <span>Seluruh tingkatan petunjuk telah terbuka. Gunakan tombol panah untuk meninjau kembali.</span>
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
