"use client";

import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import { DueReviewItem } from "@/server/services/retrieval-service";

interface SpacedReviewBannerProps {
  dueReviews: DueReviewItem[];
  onReviewCompleted?: () => void;
}

export function SpacedReviewBanner({
  dueReviews,
  onReviewCompleted,
}: SpacedReviewBannerProps) {
  const [activeReview, setActiveReview] = useState<DueReviewItem | null>(
    dueReviews[0] ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedConceptIds, setCompletedConceptIds] = useState<string[]>([]);

  if (!activeReview || completedConceptIds.includes(activeReview.conceptId)) {
    return null;
  }

  const handleRateReview = async (performance: "again" | "good" | "easy") => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/progress/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptId: activeReview.conceptId,
          performance,
        }),
      });

      if (res.ok) {
        setCompletedConceptIds((prev) => [...prev, activeReview.conceptId]);
        onReviewCompleted?.();
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-accent-muted border border-accent/30 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-accent/20 flex items-center justify-center">
            <RotateCcw className="w-4 h-4 text-accent" />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
              Spaced Retrieval (Pengulangan Terjadwal)
            </span>
            <h4 className="text-sm font-bold text-text">
              Waktunya Mengulang: {activeReview.conceptTitle}
            </h4>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
          Interval {activeReview.intervalDays} Hari
        </span>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">
        Mengulang konsep pada interval waktu yang tepat terbukti mencegah kelupaan (forgetting curve) dan memperkuat retensi memori jangka panjang.
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-text mr-1">
          Bagaimana ingatanmu tentang konsep ini?
        </span>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleRateReview("again")}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface hover:bg-surface-raised text-text transition-colors disabled:opacity-50"
        >
          Lupa / Belum Yakin
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleRateReview("good")}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-surface-raised hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-xs"
        >
          Ingat dengan Baik
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleRateReview("easy")}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-success text-surface-raised hover:bg-success/90 transition-colors disabled:opacity-50 shadow-xs"
        >
          Sangat Mudah
        </button>
      </div>
    </div>
  );
}
