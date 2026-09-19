"use client";

import React, { useState } from "react";
import { Compass, Sparkles, Target } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

export function ProjectileMotionPlayground() {
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const [v0, setV0] = useState<number>(20); // initial speed in m/s

  const g = 9.8; // gravity in m/s^2
  const angleRad = (angleDeg * Math.PI) / 180;

  // Kinematic calculations
  const v0x = v0 * Math.cos(angleRad);
  const v0y = v0 * Math.sin(angleRad);

  const timeFlight = (2 * v0y) / g;
  const maxHeight = (v0y * v0y) / (2 * g);
  const range = (v0 * v0 * Math.sin(2 * angleRad)) / g;

  // SVG coordinate transformation
  // Canvas width 500, height 220
  // Origin (ox, oy) = (40, 190)
  // Max range display ~ 65 meters, max height ~ 35 meters
  const ox = 40;
  const oy = 190;
  const scaleX = 6.5; // pixels per meter horizontally
  const scaleY = 4.5; // pixels per meter vertically

  // Generate trajectory path points: y(x) = x * tan(theta) - (g * x^2) / (2 * v0^2 * cos^2(theta))
  const pathPoints: string[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * range;
    const y = x * Math.tan(angleRad) - (g * x * x) / (2 * v0x * v0x);
    const svgX = ox + x * scaleX;
    const svgY = oy - Math.max(0, y) * scaleY;
    pathPoints.push(`${i === 0 ? "M" : "L"} ${svgX.toFixed(1)} ${svgY.toFixed(1)}`);
  }
  const trajectoryD = pathPoints.join(" ");

  // Peak and landing SVG coordinates
  const peakSvgX = ox + (range / 2) * scaleX;
  const peakSvgY = oy - maxHeight * scaleY;
  const landSvgX = ox + range * scaleX;

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            <span>Laboratorium Kinematika 2D: Gerak Parabola &amp; Trajektori</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Eksplorasi independensi gerak horizontal (GLB) dan vertikal (GLBB) di bawah pengaruh percepatan gravitasi bumi.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
            Jangkauan R = {range.toFixed(1)} m
          </span>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-raised p-4 rounded-xl border border-border">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Sudut Elevasi (&theta;):</span>
            <span className="font-mono font-bold text-accent">{angleDeg}&deg;</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            step="1"
            value={angleDeg}
            onChange={(e) => setAngleDeg(parseInt(e.target.value, 10))}
            className="w-full accent-accent cursor-pointer"
            aria-label="Atur sudut elevasi peluncuran gerak parabola"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>10&deg; (Mendatar)</span>
            <span className="text-accent font-semibold">45&deg; (Optimal)</span>
            <span>80&deg; (Vertikal)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Kecepatan Awal (v&#8320;):</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{v0} m/s</span>
          </div>
          <input
            type="range"
            min="10"
            max="26"
            step="1"
            value={v0}
            onChange={(e) => setV0(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
            aria-label="Atur kecepatan awal peluncuran v0"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>10 m/s</span>
            <span>26 m/s</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Trajectory */}
      <div className="w-full aspect-[2/1] max-h-[260px] bg-surface-raised rounded-xl border border-border relative overflow-hidden flex items-center justify-center p-3">
        <svg
          viewBox="0 0 500 220"
          className="w-full h-full select-none"
          role="img"
          aria-label={`Visualisasi kurva trajektori parabola dengan sudut ${angleDeg} derajat, tinggi puncak ${maxHeight.toFixed(1)} meter, jangkauan ${range.toFixed(1)} meter`}
        >
          {/* Ground surface and grid */}
          <line x1="20" y1={oy} x2="480" y2={oy} stroke="var(--color-border)" strokeWidth="2" />
          <line x1={ox} y1="20" x2={ox} y2={oy} stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Parabolic Trajectory */}
          {trajectoryD && (
            <path
              d={trajectoryD}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Launch point */}
          <circle cx={ox} cy={oy} r="5" fill="var(--color-accent)" />
          <text x={ox - 10} y={oy + 16} fontSize="10" fill="var(--color-text-muted)" fontWeight="bold">
            (0,0)
          </text>

          {/* Peak height indicator */}
          <circle cx={peakSvgX} cy={peakSvgY} r="4" fill="var(--color-warning)" />
          <line
            x1={peakSvgX}
            y1={peakSvgY}
            x2={peakSvgX}
            y2={oy}
            stroke="var(--color-warning)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <text
            x={peakSvgX + 6}
            y={peakSvgY + 4}
            fontSize="10"
            fill="var(--color-text)"
            fontWeight="bold"
          >
            H_max: {maxHeight.toFixed(1)} m
          </text>

          {/* Landing Point */}
          <circle cx={landSvgX} cy={oy} r="5" fill="var(--color-success)" />
          <text
            x={landSvgX - 15}
            y={oy + 16}
            fontSize="10"
            fill="var(--color-success)"
            fontWeight="bold"
          >
            R: {range.toFixed(1)} m
          </text>
        </svg>
      </div>

      {/* Kinetic Readout Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-surface-raised border border-border text-xs">
        <div>
          <span className="text-text-muted block">Komponen Laju <MathRenderer inline content="$v_{0x}$" />:</span>
          <span className="font-mono font-bold text-text">{v0x.toFixed(1)} m/s (Tetap)</span>
        </div>
        <div>
          <span className="text-text-muted block">Komponen Awal <MathRenderer inline content="$v_{0y}$" />:</span>
          <span className="font-mono font-bold text-text">{v0y.toFixed(1)} m/s</span>
        </div>
        <div>
          <span className="text-text-muted block">Tinggi Maksimum <MathRenderer inline content="$H_{\max}$" />:</span>
          <span className="font-mono font-bold text-warning">{maxHeight.toFixed(1)} m</span>
        </div>
        <div>
          <span className="text-text-muted block">Waktu Terbang (<MathRenderer inline content="$t_{\text{total}}$" />):</span>
          <span className="font-mono font-bold text-accent">{timeFlight.toFixed(2)} detik</span>
        </div>
      </div>

      {/* Analytical Reasoning Card */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
        <div className="font-bold text-text text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Hukum Fisika Kinematika 2D:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-muted leading-relaxed">
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">1. Mengapa Sudut 45&deg; Menghasilkan Jarak Terjauh?</span>
            <p>
              Jarak tempuh horizontal dirumuskan dengan <MathRenderer inline content={`$R = \\frac{v_0^2 \\sin(2\\theta)}{g}$`} />. Nilai fungsi sinus mencapai nilai maksimum 1 tepat saat argumennya <MathRenderer inline content={`$2\\theta = 90^\\circ$`} />, yang berarti <MathRenderer inline content={`$\\theta = 45^\\circ$`} />.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">2. Independensi Sumbu X dan Y:</span>
            <p>
              Gravitasi hanya bekerja pada arah vertikal (<MathRenderer inline content={`$a_y = -g$`} />), sehingga kecepatan horizontal <MathRenderer inline content={`$v_x$`} /> tidak pernah berkurang selama proyektil melayang di udara tanpa hambatan angin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
