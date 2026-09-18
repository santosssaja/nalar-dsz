"use client";

import React from "react";
import { MistakeSummaryItem } from "@/server/services/learning-service";

interface MistakeMapProps {
  mistakes: MistakeSummaryItem[];
}

export function MistakeMap({ mistakes }: MistakeMapProps) {
  if (mistakes.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-surface-raised border border-border text-center space-y-2">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-success-muted text-success text-lg">
          ✓
        </div>
        <h4 className="text-sm font-bold text-text">Pola Pemikiran Bersih</h4>
        <p className="text-xs text-text-muted max-w-sm mx-auto">
          Belum ada jebakan miskonsepsi yang terdeteksi. Pertahankan ketelitian berpikirmu!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <span>🎯</span>
            <span>Peta Miskonsepsi & Panduan Remedial</span>
          </h4>
          <p className="text-xs text-text-muted">
            Pola kekeliruan umum yang sempat terdeteksi selama sesi latihan.
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          {mistakes.length} Pola Terdeteksi
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {mistakes.map((m) => (
          <div
            key={`${m.conceptId}-${m.misconceptionCode}`}
            className="p-4 rounded-xl bg-surface-raised border border-border hover:border-amber-500/30 transition-all space-y-3 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {m.conceptTitle}
                </span>
                <h5 className="text-xs font-bold text-text mt-0.5">{m.label}</h5>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted shrink-0">
                {m.count}x muncul
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs text-text space-y-1">
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                💡 Cara Meluruskan:
              </span>
              <p className="text-text-muted leading-relaxed">{m.remediation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
