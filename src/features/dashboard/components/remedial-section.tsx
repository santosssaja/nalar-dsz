import React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import type { MistakeSummaryItem } from "@/server/services/learning-service";

interface RemedialSectionProps {
  mistakes: MistakeSummaryItem[];
}

export function RemedialSection({ mistakes }: RemedialSectionProps) {
  if (mistakes.length === 0) {
    return (
      <section
        aria-label="Peta Miskonsepsi & Remedial"
        className="p-6 rounded-2xl bg-surface-raised border border-border flex items-start gap-3.5"
      >
        <span className="p-2 rounded-xl bg-success-muted text-success shrink-0 mt-0.5">
          <CheckCircle className="w-5 h-5" />
        </span>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-text">
            Belum Ada Miskonsepsi Aktif Terdeteksi
          </h3>
          <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
            Penalaran dan logika konseptual Anda pada latihan sebelumnya berjalan dengan baik. Jika di kemudian hari sistem mendeteksi jebakan intuisi umum, area pembenahan akan ditampilkan di sini untuk dipelajari kembali.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Peta Miskonsepsi & Remedial" className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-warning" />
        <h2 className="text-base font-bold text-text">
          Peta Miskonsepsi &amp; Area Pembenahan Logika ({mistakes.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mistakes.map((item) => (
          <div
            key={`${item.conceptId}-${item.misconceptionCode}`}
            className="p-5 rounded-2xl bg-surface-raised border border-border flex flex-col justify-between gap-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-accent">
                  {item.conceptTitle}
                </span>
                <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded bg-surface border border-border">
                  Muncul {item.count}x
                </span>
              </div>

              <h4 className="text-sm font-bold text-text">
                {item.label}
              </h4>

              <p className="text-xs text-text-muted leading-relaxed">
                {item.remediation}
              </p>
            </div>

            <div className="pt-2 border-t border-border-subtle flex justify-end">
              <Link
                href={`/learn/${item.conceptId}`}
                className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
              >
                <span>Perbaiki Pemahaman</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
