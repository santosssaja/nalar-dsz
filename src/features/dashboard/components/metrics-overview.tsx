import React from "react";
import { CheckCircle2, BookOpen, CalendarClock, TrendingUp } from "lucide-react";

interface MetricsOverviewProps {
  totalConcepts: number;
  masteredCount: number;
  inProgressCount: number;
  dueReviewsCount: number;
  overallMasteryPercentage: number;
}

export function MetricsOverview({
  totalConcepts,
  masteredCount,
  inProgressCount,
  dueReviewsCount,
  overallMasteryPercentage,
}: MetricsOverviewProps) {
  return (
    <section aria-label="Ringkasan Metrik Penguasaan" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Mastered Concepts */}
      <div className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted">Konsep Dikuasai</span>
          <span className="p-1.5 rounded-lg bg-success-muted text-success">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-text">{masteredCount}</span>
            <span className="text-xs text-text-muted font-mono">/ {totalConcepts} Konsep</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1 leading-snug">
            Tuntas dibuktikan lewat evaluasi penalaran mandiri, bukan hafalan.
          </p>
        </div>
      </div>

      {/* 2. In Progress */}
      <div className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted">Sedang Berjalan</span>
          <span className="p-1.5 rounded-lg bg-accent-muted text-accent">
            <BookOpen className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-text">{inProgressCount}</span>
            <span className="text-xs text-text-muted font-mono">Konsep Aktif</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1 leading-snug">
            Sedang dalam tahap eksplorasi intuisi dan latihan terbimbing.
          </p>
        </div>
      </div>

      {/* 3. Spaced Reviews Due */}
      <div className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted">Uji Retensi Jatuh Tempo</span>
          <span
            className={`p-1.5 rounded-lg ${
              dueReviewsCount > 0
                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                : "bg-surface text-text-muted"
            }`}
          >
            <CalendarClock className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-text">{dueReviewsCount}</span>
            <span className="text-xs text-text-muted font-mono">Jatuh Tempo</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1 leading-snug">
            {dueReviewsCount > 0
              ? "Perlu diulang hari ini agar memori jangka panjang terkunci."
              : "Semua pengulangan terjadwal saat ini berada dalam kondisi optimal."}
          </p>
        </div>
      </div>

      {/* 4. Mastery Dimensions Average */}
      <div className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted">Indeks Pemahaman</span>
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-text">
              {Math.round(overallMasteryPercentage)}%
            </span>
            <span className="text-xs text-text-muted font-mono">Rata-rata 6 Dimensi</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1 leading-snug">
            Akumulasi skor pemahaman, latihan, aplikasi, dan daya retensi.
          </p>
        </div>
      </div>
    </section>
  );
}
