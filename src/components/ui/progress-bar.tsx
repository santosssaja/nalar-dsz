import React from "react";

interface MasteryBarProps {
  label: string;
  value: number; // 0 - 100
  colorClassName?: string;
}

export function MasteryBar({
  label,
  value,
  colorClassName = "bg-accent",
}: MasteryBarProps) {
  const boundedVal = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-text capitalize">{label}</span>
        <span className="text-text-muted font-mono font-semibold">
          {boundedVal}%
        </span>
      </div>
      <div
        className="w-full h-2 rounded-full bg-surface-overlay border border-border overflow-hidden"
        role="progressbar"
        aria-valuenow={boundedVal}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} mastery: ${boundedVal}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClassName}`}
          style={{ width: `${boundedVal}%` }}
        />
      </div>
    </div>
  );
}

interface MasteryGridProps {
  dimensions: {
    understanding: number;
    practice: number;
    application: number;
    transfer: number;
    explanation: number;
    retention: number;
  };
}

export function MasteryGrid({ dimensions }: MasteryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface border border-border">
      <MasteryBar label="Understanding (Konsep)" value={dimensions.understanding} />
      <MasteryBar label="Practice (Kelancaran)" value={dimensions.practice} />
      <MasteryBar label="Application (Aplikasi)" value={dimensions.application} />
      <MasteryBar label="Transfer (Konteks Baru)" value={dimensions.transfer} />
      <MasteryBar label="Explanation (Penalaran)" value={dimensions.explanation} />
      <MasteryBar label="Retention (Daya Ingat)" value={dimensions.retention} />
    </div>
  );
}
