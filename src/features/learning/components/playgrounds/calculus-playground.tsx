"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

export function CalculusPlayground() {
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
  const slopeTangent = 2.0; // exact derivative of x^2 at x=1

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
    <div className="space-y-4 p-4 rounded-xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-text inline-flex items-center gap-1">
          <span>Visualisasi Kurva</span>
          <MathRenderer inline content="$f(x) = x^2$" />
          <span>dan Garis Potong (Secant)</span>
        </span>
        <div className="flex items-center gap-4 text-text-muted font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent"></span>
            <span>Titik</span>
            <MathRenderer inline content="$A(1, 1)$" />
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
            <span>Titik</span>
            <MathRenderer inline content={`$B(${xB.toFixed(2)}, ${yB.toFixed(2)})$`} />
          </span>
        </div>
      </div>

      {/* SVG Graph */}
      <div className="w-full aspect-[4/3] max-h-[300px] bg-surface-raised rounded-lg border border-border-subtle relative overflow-hidden flex items-center justify-center">
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

          {/* Tangent Line (exact at x=1, m=2) */}
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

      {/* Slider Controls */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="h-slider" className="font-semibold text-text flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1">
              <span>Ubah Jarak Titik B (</span>
              <MathRenderer inline content="$h$" />
              <span>):</span>
            </span>
            <span className="font-mono text-accent text-sm font-bold">{h.toFixed(2)}</span>
          </label>
          <span className="text-text-muted flex items-center gap-1">
            {h <= 0.05 ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="text-accent font-semibold flex items-center gap-1">
                  <MathRenderer inline content="$h$" />
                  <span>mendekati nol (Limit dicapai!)</span>
                </span>
              </>
            ) : (
              "Tarik slider ke kiri mendekati 0"
            )}
          </span>
        </div>

        <input
          id="h-slider"
          type="range"
          min="0.01"
          max="2.0"
          step="0.01"
          value={h}
          onChange={(e) => setH(parseFloat(e.target.value))}
          className="w-full h-2 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent"
          aria-label="Pengatur jarak h antar titik pada kurva"
        />

        <div className="flex justify-between text-[10px] text-text-muted font-mono">
          <span>0.01 (Garis Singgung)</span>
          <span>1.00</span>
          <span>2.00 (Garis Potong Lebar)</span>
        </div>
      </div>

      {/* Dynamic Data Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-surface-raised text-xs">
        <div>
          <span className="text-text-muted flex items-center gap-1">
            <span>Selisih Absis (</span>
            <MathRenderer inline content="$h = \Delta x$" />
            <span>):</span>
          </span>
          <span className="font-mono font-bold text-text">{h.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-text-muted flex items-center gap-1">
            <span>Kemiringan Secant (</span>
            <MathRenderer inline content="$m_{\text{sec}}$" />
            <span>):</span>
          </span>
          <span className="font-mono font-bold text-accent">{slopeSecant.toFixed(3)}</span>
        </div>
        <div>
          <span className="text-text-muted flex items-center gap-1">
            <span>Kemiringan Tangent (</span>
            <MathRenderer inline content="$f'(1)$" />
            <span>):</span>
          </span>
          <span className="font-mono font-bold text-success">{slopeTangent.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
}
