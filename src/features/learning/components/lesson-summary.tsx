"use client";

import React from "react";
import { ConceptContent } from "@/content/schema";
import { ConceptMasterySnapshot } from "@/server/services/mastery-engine";
import { MasteryGrid } from "@/components/ui/progress-bar";

interface LessonSummaryProps {
  concept: ConceptContent;
  masterySnapshot: ConceptMasterySnapshot | null;
  moduleSlug: string;
}

export function LessonSummary({
  concept,
  masterySnapshot,
  moduleSlug,
}: LessonSummaryProps) {
  const dimensions = masterySnapshot ?? {
    understanding: 80,
    practice: 75,
    application: 40,
    transfer: 0,
    explanation: 0,
    retention: 0,
    status: "practiced",
  };

  return (
    <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-surface-raised border border-border space-y-8 text-center">
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto text-3xl font-bold">
          ✓
        </div>
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          Konsep Selesai
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-text">
          {concept.title}
        </h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Kamu telah menyelesaikan rangkaian eksplorasi, prediksi, pemahaman formal, dan latihan terarah.
        </p>
      </div>

      <div className="text-left space-y-3">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Bukti Pemahaman (6 Dimensi Mastery):
        </h3>
        <MasteryGrid dimensions={dimensions} />
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href={`/modules/${moduleSlug}`}
          className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium border border-border hover:bg-surface text-text transition-colors"
        >
          ← Kembali ke Gambaran Modul
        </a>
        <a
          href="/modules/turunan"
          className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
        >
          Lanjut ke Konsep Berikutnya →
        </a>
      </div>
    </div>
  );
}
