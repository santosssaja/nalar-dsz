import React from "react";
import Link from "next/link";
import { ArrowRight, BookMarked } from "lucide-react";

export interface ModuleProgressSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  domainSlug: string;
  estimatedMinutes: number;
  totalConcepts: number;
  completedConcepts: number;
  masteredConcepts: number;
}

interface ModuleProgressCardsProps {
  modules: ModuleProgressSummary[];
}

const DOMAIN_BADGES: Record<string, string> = {
  matematika: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  fisika: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  kimia: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  biologi: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

export function ModuleProgressCards({ modules }: ModuleProgressCardsProps) {
  return (
    <section aria-label="Kemajuan Belajar per Modul" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-accent" />
          <h2 className="text-base font-bold text-text">
            Kemajuan Kurikulum Modul STEM (5 Modul)
          </h2>
        </div>
        <Link
          href="/domains"
          className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
        >
          <span>Lihat Seluruh Kurikulum</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const percent =
            mod.totalConcepts > 0
              ? Math.round((mod.completedConcepts / mod.totalConcepts) * 100)
              : 0;
          const badgeClass =
            DOMAIN_BADGES[mod.domainSlug] ??
            "bg-surface text-text-muted border-border";

          return (
            <div
              key={mod.id}
              className="p-5 rounded-2xl bg-surface-raised border border-border flex flex-col justify-between gap-4 hover:border-border-strong transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}
                  >
                    {mod.domainSlug}
                  </span>
                  <span className="text-[11px] text-text-muted font-mono">
                    ± {Math.round(mod.estimatedMinutes / 60)} Jam
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text leading-snug">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                    {mod.summary}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border-subtle">
                {/* Progress Stats */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">
                      {mod.completedConcepts} dari {mod.totalConcepts} Konsep Tuntas
                    </span>
                    <span className="font-mono font-bold text-text">{percent}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-border-subtle">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${Math.max(percent > 0 ? 5 : 0, percent)}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/modules/${mod.slug}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-surface hover:bg-surface-overlay text-text border border-border hover:border-accent transition-all shadow-2xs group"
                >
                  <span>{percent > 0 ? "Lanjutkan Modul" : "Mulai Modul"}</span>
                  <ArrowRight className="w-3 h-3 text-accent group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
