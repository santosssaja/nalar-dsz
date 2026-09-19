"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
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
    understanding: 0,
    practice: 0,
    application: 0,
    transfer: 0,
    explanation: 0,
    retention: 0,
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border text-center space-y-6 max-w-xl mx-auto shadow-sm">
      <div className="w-16 h-16 rounded-full bg-success-muted text-success border border-success/30 mx-auto flex items-center justify-center shadow-xs">
        <Check className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-success-muted text-success">
          <span>Konsep Selesai</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-text">
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
        <Link
          href={`/modules/${moduleSlug}`}
          className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium border border-border hover:bg-surface text-text transition-colors"
        >
          ← Kembali ke Gambaran Modul
        </Link>
        <Link
          href={`/modules/${moduleSlug}`}
          className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
        >
          Lanjut ke Konsep Berikutnya →
        </Link>
      </div>
    </div>
  );
}
