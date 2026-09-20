"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { GraphNode } from "@/content/registry";

interface ConceptNodeDetailCardProps {
  selectedNode: GraphNode;
  onClose: () => void;
}

export function ConceptNodeDetailCard({ selectedNode, onClose }: ConceptNodeDetailCardProps) {
  return (
    <div
      role="region"
      aria-label={`Detail konsep ${selectedNode.title}`}
      className="p-4 sm:p-5 rounded-2xl bg-surface-raised border border-accent/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 animate-in fade-in duration-200"
    >
      <div className="space-y-1 sm:space-y-1.5 flex-1 pr-4 sm:pr-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-accent/10 text-accent">
            {selectedNode.domainSlug}
          </span>
          <span className="text-[11px] sm:text-xs text-text-muted">
            {selectedNode.stepCount} Langkah Belajar • Tingkat: {selectedNode.difficulty}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-text">{selectedNode.title}</h3>
        <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
          {selectedNode.summary}
        </p>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-border/60 sm:border-0 justify-end">
        <Link
          href={`/learn/${selectedNode.slug}`}
          className="flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
        >
          Mulai Pelajari Konsep →
        </Link>
        <button
          type="button"
          onClick={onClose}
          title="Tutup detail konsep"
          aria-label="Tutup detail konsep"
          className="px-3 py-2.5 rounded-lg text-xs font-medium border border-border hover:bg-surface text-text-muted flex items-center justify-center gap-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Tutup</span>
        </button>
      </div>
    </div>
  );
}
