import React from "react";

export default function RootLoading() {
  return (
    <div
      className="space-y-8 py-4 animate-pulse max-w-5xl mx-auto"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">Memuat halaman Nalar...</span>

      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-accent/20 rounded-full" />
        <div className="h-8 sm:h-10 w-3/4 max-w-md bg-surface-raised border border-border rounded-xl" />
        <div className="h-4 w-full max-w-xl bg-surface-raised/70 rounded-lg" />
      </div>

      {/* Content Cards Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div className="p-6 rounded-2xl bg-surface-raised border border-border space-y-4">
          <div className="h-5 w-2/5 bg-border rounded-md" />
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-border/60 rounded" />
            <div className="h-3.5 w-4/5 bg-border/60 rounded" />
          </div>
          <div className="h-9 w-28 bg-border rounded-lg mt-2" />
        </div>

        <div className="p-6 rounded-2xl bg-surface-raised border border-border space-y-4">
          <div className="h-5 w-2/5 bg-border rounded-md" />
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-border/60 rounded" />
            <div className="h-3.5 w-4/5 bg-border/60 rounded" />
          </div>
          <div className="h-9 w-28 bg-border rounded-lg mt-2" />
        </div>
      </div>
    </div>
  );
}
