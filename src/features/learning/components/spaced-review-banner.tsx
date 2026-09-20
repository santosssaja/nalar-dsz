"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, CheckCircle2, X } from "lucide-react";
import { DueReviewItem } from "@/server/services/retrieval-service";

interface SpacedReviewBannerProps {
  dueReviews: DueReviewItem[];
  onReviewCompleted?: () => void;
}

export function SpacedReviewBanner({
  dueReviews,
  onReviewCompleted,
}: SpacedReviewBannerProps) {
  const router = useRouter();
  const [completedConceptIds, setCompletedConceptIds] = useState<string[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out concepts that have already been reviewed in this session
  const remainingReviews = dueReviews.filter(
    (item) => !completedConceptIds.includes(item.conceptId)
  );

  const activeReview = remainingReviews[0] ?? null;
  const totalCount = dueReviews.length;
  const currentNumber = completedConceptIds.length + 1;

  // If user dismissed remaining reviews for this session
  if (isDismissed) {
    return null;
  }

  // If all due reviews in this queue have been completed
  if (!activeReview) {
    if (completedConceptIds.length > 0) {
      return (
        <div className="p-4 rounded-xl bg-success-muted border border-success/30 flex items-center justify-between gap-3 text-xs text-success animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>
              Hebat! Seluruh pengulangan terjadwal ({completedConceptIds.length} konsep) telah berhasil kamu tuntaskan hari ini.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md hover:bg-success/20 transition-colors text-success"
            title="Tutup pemberitahuan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }
    return null;
  }

  const handleRateReview = async (performance: "again" | "good" | "easy") => {
    if (isSubmitting || !activeReview) return;
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
        const nextCompleted = [...completedConceptIds, activeReview.conceptId];
        setCompletedConceptIds(nextCompleted);
        onReviewCompleted?.();

        // If this was the last review in the queue, sync server state
        if (nextCompleted.length >= totalCount) {
          router.refresh();
        }
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-accent-muted border border-accent/30 space-y-3 shadow-xs transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <RotateCcw className="w-4 h-4 text-accent" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                Spaced Retrieval (Pengulangan Terjadwal)
              </span>
              {totalCount > 1 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-accent/30 text-accent font-semibold">
                  Konsep {currentNumber} dari {totalCount} antrean
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-text mt-0.5">
              Waktunya Mengulang: {activeReview.conceptTitle}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
            Interval {activeReview.intervalDays} Hari
          </span>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-overlay transition-colors"
            title="Tunda ulasan untuk nanti"
            aria-label="Tunda ulasan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
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

        {isSubmitting && (
          <span className="text-xs text-text-muted ml-2">Menyimpan...</span>
        )}

        {totalCount > 1 && (
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-xs text-text-muted hover:text-text underline ml-auto transition-colors"
          >
            Tunda sisanya nanti
          </button>
        )}
      </div>
    </div>
  );
}
