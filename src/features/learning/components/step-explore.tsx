"use client";

import React, { useState } from "react";
import { StepContent } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";

interface StepExploreProps {
  step: StepContent;
  isCompleted: boolean;
  onCompleted: () => void;
}

export function StepExplore({ step, isCompleted, onCompleted }: StepExploreProps) {
  const [h, setH] = useState<number>(1.0);

  // Fixed point A at x = 1, y = 1
  const xA = 1;
  const yA = 1;

  // Moving point B at x = 1 + h, y = (1 + h)^2
  const xB = xA + h;
  const yB = xB * xB;

  // Secant slope: (yB - yA) / h = (2h + h^2) / h = 2 + h
  const deltaY = yB - yA;
  const slopeSecant = deltaY / h;
  const slopeTangent = 2.0; // exact derivative at x=1

  // SVG viewport transform (viewBox: 0 0 400 300)
  // X: [0, 4] -> [40, 360], Y: [0, 9] -> [260, 40]
  const toSvgX = (x: number) => 40 + (x / 3.5) * 320;
  const toSvgY = (y: number) => 260 - (y / 9) * 220;

  // Generate curve path points for f(x) = x^2 from x=0 to x=3
  const curvePoints: string[] = [];
  for (let x = 0; x <= 3; x += 0.1) {
    const y = x * x;
    curvePoints.push(`${toSvgX(x)},${toSvgY(y)}`);
  }
  const curvePathD = `M ${curvePoints.join(" L ")}`;

  // Secant line coordinates extended
  const ptAx = toSvgX(xA);
  const ptAy = toSvgY(yA);
  const ptBx = toSvgX(xB);
  const ptBy = toSvgY(yB);

  return (
    <div className="p-6 rounded-xl bg-surface-raised border border-border space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-muted text-accent mb-2">
          <span>Interactive Playground</span>
          <span>•</span>
          <span>Manipulasi Parameter</span>
        </div>
        <h3 className="text-xl font-bold text-text">{step.title}</h3>
        <p className="text-sm text-text-muted mt-1">{step.instruction}</p>
      </div>

      <div className="text-sm text-text">
        <MathRenderer content={step.content} />
      </div>

      {/* Interactive Visualizer Canvas */}
      <div className="p-4 rounded-xl bg-surface border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <span className="font-semibold text-text">
            Visualisasi Kurva $f(x) = x^2$ dan Garis Potong (Secant)
          </span>
          <div className="flex items-center gap-4 text-text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
              Titik $A(1, 1)$
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
              Titik $B({xB.toFixed(2)}, {yB.toFixed(2)})$
            </span>
          </div>
        </div>

        {/* SVG Graph */}
        <div className="w-full aspect-[4/3] max-h-[320px] bg-surface-raised rounded-lg border border-border-subtle relative overflow-hidden flex items-center justify-center">
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full select-none"
            aria-label="Grafik interaktif kurva f(x) = x kuadrat"
          >
            {/* Grid & Axis */}
            <line x1="40" y1="260" x2="380" y2="260" stroke="var(--color-border)" strokeWidth="1.5" />
            <line x1="40" y1="20" x2="40" y2="260" stroke="var(--color-border)" strokeWidth="1.5" />

            {/* Parabola Curve */}
            <path
              d={curvePathD}
              fill="none"
              stroke="var(--color-text)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Tangent Line (exact at x=1, m=2: y - 1 = 2(x - 1) -> y = 2x - 1) */}
            <line
              x1={toSvgX(0)}
              y1={toSvgY(2 * 0 - 1)}
              x2={toSvgX(3)}
              y2={toSvgY(2 * 3 - 1)}
              stroke="var(--color-success)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
            />

            {/* Secant Line connecting A and B */}
            <line
              x1={toSvgX(xA - 0.5)}
              y1={toSvgY(yA - 0.5 * slopeSecant)}
              x2={toSvgX(xB + 0.5)}
              y2={toSvgY(yB + 0.5 * slopeSecant)}
              stroke="var(--color-accent)"
              strokeWidth="2"
            />

            {/* Points A and B */}
            <circle cx={ptAx} cy={ptAy} r="5" fill="var(--color-accent)" />
            <circle cx={ptBx} cy={ptBy} r="5" fill="var(--color-warning)" />

            {/* Coordinate labels */}
            <text x={ptAx - 15} y={ptAy - 10} fontSize="11" fill="var(--color-text)" fontWeight="bold">
              A(1,1)
            </text>
            <text x={ptBx + 8} y={ptBy - 8} fontSize="11" fill="var(--color-text)" fontWeight="bold">
              B
            </text>
          </svg>
        </div>

        {/* Parameter Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="h-slider" className="font-semibold text-text">
              Jarak Horizontal ($h = \Delta x$):{" "}
              <span className="font-mono text-accent font-bold text-sm">
                {h.toFixed(2)}
              </span>
            </label>
            <span className="text-text-muted">
              {h <= 0.1 ? "⚡ Sangat Dekat (Limit)!" : "Geser ke kiri untuk mendekatkan titik B"}
            </span>
          </div>

          <input
            id="h-slider"
            type="range"
            min="0.02"
            max="2.0"
            step="0.02"
            value={h}
            onChange={(e) => setH(parseFloat(e.target.value))}
            className="w-full accent-accent cursor-pointer h-2 bg-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Penggeser jarak horizontal h"
            aria-valuemin={0.02}
            aria-valuemax={2.0}
            aria-valuenow={h}
            aria-valuetext={`Jarak h adalah ${h.toFixed(2)}, kemiringan secant adalah ${slopeSecant.toFixed(3)}`}
          />

          {/* Quick presets for keyboard / touch users */}
          <div className="flex flex-wrap items-center gap-2 pt-1" aria-label="Pilihan cepat jarak h">
            <span className="text-[11px] text-text-muted font-medium">Pilihan Cepat:</span>
            {[
              { val: 1.5, label: "Jauh (h = 1.5)" },
              { val: 0.5, label: "Sedang (h = 0.5)" },
              { val: 0.1, label: "Dekat (h = 0.1)" },
              { val: 0.02, label: "Limit (h → 0)" },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setH(p.val)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-colors ${
                  Math.abs(h - p.val) < 0.01
                    ? "bg-accent text-surface-raised border-accent shadow-2xs"
                    : "bg-surface-raised border-border text-text hover:bg-surface"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="sr-only" aria-live="polite">
            {`Jarak h diatur ke ${h.toFixed(2)}. Kemiringan garis secant adalah ${slopeSecant.toFixed(3)}, mendekati kemiringan garis singgung 2.0.`}
          </div>
        </div>

        {/* Real-time Math Feedback */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center text-xs">
          <div className="p-3 rounded-lg bg-surface-raised border border-border-subtle">
            <span className="text-text-muted block">Selisih Tinggi (Δy)</span>
            <span className="text-sm font-mono font-bold text-text">
              {deltaY.toFixed(3)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-raised border border-border-subtle">
            <span className="text-text-muted block">Kemiringan Secant (Δy / h)</span>
            <span className="text-sm font-mono font-bold text-accent">
              {slopeSecant.toFixed(3)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-accent-muted/30 border border-accent/20">
            <span className="text-accent font-semibold block">Target Limit Singgung (f&apos;(1))</span>
            <span className="text-sm font-mono font-bold text-accent">
              {slopeTangent.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onCompleted}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
        >
          {isCompleted ? "Lanjut ke Langkah Berikutnya →" : "Saya Mengerti, Lanjutkan →"}
        </button>
      </div>
    </div>
  );
}
