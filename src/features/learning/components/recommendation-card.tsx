"use client";

import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { RecommendationResult } from "@/server/services/recommendation-engine";

interface RecommendationCardProps {
  recommendation: RecommendationResult;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const getBadgeStyle = () => {
    switch (recommendation.reasonCode) {
      case "PREREQUISITE_INCOMPLETE":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "RETRIEVAL_DUE":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "MISCONCEPTION_REMEDIAL":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "PATH_COMPLETED":
        return "bg-success-muted text-success border-success/30";
      case "NEXT_PATH_NODE":
      default:
        return "bg-accent-muted text-accent border-accent/30";
    }
  };

  const getReasonLabel = () => {
    switch (recommendation.reasonCode) {
      case "PREREQUISITE_INCOMPLETE":
        return "Prasyarat Penting";
      case "RETRIEVAL_DUE":
        return "Pengulangan Terjadwal";
      case "MISCONCEPTION_REMEDIAL":
        return "Remedial Miskonsepsi";
      case "PATH_COMPLETED":
        return "Jalur Tuntas";
      case "NEXT_PATH_NODE":
      default:
        return "Rekomendasi Jalur Belajar";
    }
  };

  return (
    <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-accent/20 flex items-center justify-center">
            <Compass className="w-4 h-4 text-accent" />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Navigasi Adaptif Nalar
            </span>
            <h4 className="text-sm font-bold text-text">Langkah Paling Efektif Untukmu</h4>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeStyle()}`}
        >
          {getReasonLabel()}
        </span>
      </div>

      <div className="p-3.5 rounded-lg bg-surface border border-border-subtle space-y-1.5">
        <div className="font-semibold text-xs text-text flex items-center justify-between">
          <span>Target: {recommendation.targetTitle}</span>
          <span className="text-[10px] text-text-muted font-mono">
            Prioritas {recommendation.priority}
          </span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          {recommendation.reasonText}
        </p>
      </div>

      <div className="flex justify-end">
        {recommendation.targetType === "concept" || recommendation.targetType === "review" ? (
          <Link
            href={`/learn/${recommendation.targetSlug}`}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-xs"
          >
            Buka Pelajaran Sekarang →
          </Link>
        ) : (
          <Link
            href={`/modules/${recommendation.targetSlug}`}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-surface border border-border text-text hover:bg-surface-raised transition-colors"
          >
            Lihat Ikhtisar Modul →
          </Link>
        )}
      </div>
    </div>
  );
}
