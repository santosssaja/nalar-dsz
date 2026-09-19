import React from "react";
import { BrainCircuit, Info } from "lucide-react";

export interface DimensionsScore {
  understanding: number;
  practice: number;
  application: number;
  transfer: number;
  explanation: number;
  retention: number;
}

interface MasteryDimensionsPanelProps {
  dimensions: DimensionsScore;
}

interface DimensionConfig {
  key: keyof DimensionsScore;
  label: string;
  desc: string;
  colorClass: string;
}

const DIMENSIONS_CONFIG: DimensionConfig[] = [
  {
    key: "understanding",
    label: "Pemahaman Konsep",
    desc: "Penguasaan dasar intuisi dan prinsip 'mengapa' di balik konsep.",
    colorClass: "bg-indigo-500",
  },
  {
    key: "practice",
    label: "Kelancaran Latihan",
    desc: "Akurasi dan kemandirian pengerjaan tanpa mengandalkan hint.",
    colorClass: "bg-cyan-500",
  },
  {
    key: "application",
    label: "Aplikasi Nyata",
    desc: "Kemampuan memecahkan simulasi dan skenario sains terapan.",
    colorClass: "bg-amber-500",
  },
  {
    key: "transfer",
    label: "Transfer Lintas Konsep",
    desc: "Menghubungkan pola solusi ke permasalahan baru di luar contoh.",
    colorClass: "bg-emerald-500",
  },
  {
    key: "explanation",
    label: "Artikulasi Penjelasan",
    desc: "Menjelaskan logika berpikir ke AI Tutor Nai pada tahap akhir.",
    colorClass: "bg-purple-500",
  },
  {
    key: "retention",
    label: "Ketahanan Retensi",
    desc: "Daya ingat jangka panjang saat diuji melalui Spaced Retrieval.",
    colorClass: "bg-rose-500",
  },
];

export function MasteryDimensionsPanel({ dimensions }: MasteryDimensionsPanelProps) {
  return (
    <section
      aria-label="Profil 6 Dimensi Penguasaan Nalar"
      className="p-6 rounded-2xl bg-surface-raised border border-border space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-accent/20 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-accent" />
          </span>
          <div>
            <h2 className="text-base font-bold text-text">
              Profil 6 Dimensi Penguasaan Belajar
            </h2>
            <p className="text-xs text-text-muted">
              Nalar mengevaluasi pemahaman mendalam secara multidimensi, bukan sekadar skor benar/salah.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-text-muted bg-surface px-2.5 py-1 rounded-lg border border-border self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 shrink-0 text-accent" />
          <span>Skala Kompetensi 0 – 100</span>
        </div>
      </div>

      {/* Grid of 6 Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DIMENSIONS_CONFIG.map((dim) => {
          const score = Math.round(dimensions[dim.key] ?? 0);
          return (
            <div
              key={dim.key}
              className="p-4 rounded-xl bg-surface border border-border-subtle space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text">{dim.label}</span>
                <span className="font-mono font-bold text-text">{score} / 100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden border border-border-subtle">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${dim.colorClass}`}
                  style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
                />
              </div>

              <p className="text-[11px] text-text-muted leading-relaxed">
                {dim.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
