import React from "react";

export default function ModuleLoading() {
  return (
    <div
      className="space-y-10 py-4 max-w-4xl mx-auto animate-pulse"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">Memuat ikhtisar modul pembelajaran...</span>

      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-28 bg-border rounded" />
        <div className="h-5 w-36 bg-accent/20 rounded-full" />
        <div className="h-9 sm:h-12 w-3/4 max-w-lg bg-surface-raised border border-border rounded-xl" />
        <div className="h-4 w-full max-w-2xl bg-surface-raised/80 rounded" />

        {/* 3 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
            <div className="h-3 w-16 bg-border/60 rounded" />
            <div className="h-6 w-24 bg-border rounded" />
          </div>
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
            <div className="h-3 w-20 bg-border/60 rounded" />
            <div className="h-6 w-28 bg-border rounded" />
          </div>
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2 col-span-2 sm:col-span-1">
            <div className="h-3 w-16 bg-border/60 rounded" />
            <div className="h-6 w-20 bg-accent/20 rounded" />
          </div>
        </div>
      </div>

      {/* Recommendation Card Skeleton */}
      <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-3">
        <div className="h-4 w-48 bg-accent/20 rounded" />
        <div className="h-14 w-full bg-surface rounded-lg border border-border-subtle" />
        <div className="flex justify-end">
          <div className="h-8 w-36 bg-border rounded-lg" />
        </div>
      </div>

      {/* Concept Sequence List */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-border rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-surface-raised border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-border" />
                  <div className="h-4 w-24 bg-border/70 rounded-full" />
                </div>
                <div className="h-5 w-1/2 bg-border rounded" />
                <div className="h-3.5 w-3/4 bg-border/50 rounded" />
              </div>
              <div className="h-10 w-32 bg-accent/20 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
