import React from "react";
import Link from "next/link";
import { FlaskConical, Network, ArrowRight } from "lucide-react";

export function QuickLabsCard() {
  return (
    <section aria-label="Wahana Penjelajahan Interaktif" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Nalar Lab */}
      <Link
        href="/lab"
        className="p-5 rounded-2xl bg-surface-raised border border-border hover:border-accent transition-all group flex items-start justify-between gap-4 shadow-2xs"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <FlaskConical className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              14 Stasiun Eksperimen
            </span>
          </div>
          <h3 className="text-sm font-bold text-text group-hover:text-accent transition-colors">
            Nalar Lab: Ruang Bermain Sains
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Eksperimen mandiri parameter gerak proyektil, kurva turunan, orbital elektron Bohr, hingga siklus respirasi ATP.
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 mt-2" />
      </Link>

      {/* Concept Graph */}
      <Link
        href="/graph"
        className="p-5 rounded-2xl bg-surface-raised border border-border hover:border-accent transition-all group flex items-start justify-between gap-4 shadow-2xs"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Network className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              47 Konsep Terhubung
            </span>
          </div>
          <h3 className="text-sm font-bold text-text group-hover:text-accent transition-colors">
            Peta Graf Konsep STEM (2D)
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Jelajahi jejaring keterhubungan prasyarat antardisiplin ilmu dari Fondasi Matematika hingga Biologi Dasar.
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 mt-2" />
      </Link>
    </section>
  );
}
