import React from "react";

export default function LessonLoading() {
  return (
    <div
      className="max-w-3xl mx-auto space-y-4 sm:space-y-5 py-2 animate-pulse"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">Menyiapkan materi pembelajaran interaktif...</span>

      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-border rounded" />
          <div className="h-5 sm:h-6 w-48 bg-border rounded-lg" />
        </div>
        <div className="h-7 w-24 bg-border/60 rounded-lg shrink-0" />
      </div>

      {/* Stepper Dots Skeleton */}
      <div className="flex items-center gap-1.5 justify-center py-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full ${i === 1 ? "w-8 bg-accent" : "w-2 bg-border"}`}
          />
        ))}
      </div>

      {/* Main Lesson Step Card Skeleton */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface-raised border border-border space-y-4 shadow-sm">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-accent/20 rounded-full" />
          <div className="h-6 w-3/4 max-w-sm bg-border rounded-md" />
          <div className="h-3.5 w-full bg-border/50 rounded" />
        </div>

        {/* Interactive / Content Area */}
        <div className="w-full aspect-[16/9] max-h-[280px] bg-surface rounded-xl border border-border-subtle flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-border/40" />
        </div>

        {/* Footer controls skeleton */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div className="h-8 w-20 bg-border/40 rounded-lg" />
          <div className="h-9 w-32 bg-accent/30 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
