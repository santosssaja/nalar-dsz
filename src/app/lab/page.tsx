"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MathRenderer } from "@/components/ui/katex-math";

interface LabFunction {
  id: string;
  name: string;
  formulaKatex: string;
  derivativeKatex: string;
  fn: (x: number) => number;
  dfn: (x: number) => number;
  xRange: [number, number];
  yRange: [number, number];
  defaultX: number;
}

const LAB_FUNCTIONS: LabFunction[] = [
  {
    id: "quadratic",
    name: "Parabola Sederhana",
    formulaKatex: "f(x) = x^2",
    derivativeKatex: "f'(x) = 2x",
    fn: (x) => x * x,
    dfn: (x) => 2 * x,
    xRange: [-2.5, 2.5],
    yRange: [-1, 6],
    defaultX: 1,
  },
  {
    id: "cubic",
    name: "Polinomial Kubik",
    formulaKatex: "f(x) = x^3 - 3x",
    derivativeKatex: "f'(x) = 3x^2 - 3",
    fn: (x) => x * x * x - 3 * x,
    dfn: (x) => 3 * x * x - 3,
    xRange: [-2.5, 2.5],
    yRange: [-4, 4],
    defaultX: 0,
  },
  {
    id: "sine",
    name: "Gelombang Sinusoidal",
    formulaKatex: "f(x) = 2\\sin(x)",
    derivativeKatex: "f'(x) = 2\\cos(x)",
    fn: (x) => 2 * Math.sin(x),
    dfn: (x) => 2 * Math.cos(x),
    xRange: [-3.2, 3.2],
    yRange: [-3, 3],
    defaultX: 0.5,
  },
  {
    id: "sqrt",
    name: "Fungsi Akar Kuadrat",
    formulaKatex: "f(x) = \\sqrt{x}",
    derivativeKatex: "f'(x) = \\frac{1}{2\\sqrt{x}}",
    fn: (x) => Math.sqrt(Math.max(0, x)),
    dfn: (x) => (x <= 0.05 ? 5 : 1 / (2 * Math.sqrt(x))),
    xRange: [0, 4.5],
    yRange: [-0.5, 3],
    defaultX: 1,
  },
];

export default function NalarLabPage() {
  const [selectedFuncId, setSelectedFuncId] = useState<string>("quadratic");
  const [x0, setX0] = useState<number>(1.0);
  const [showDerivativeCurve, setShowDerivativeCurve] = useState<boolean>(true);
  const [showSecant, setShowSecant] = useState<boolean>(false);
  const [h, setH] = useState<number>(0.5);

  const activeFunc =
    LAB_FUNCTIONS.find((f) => f.id === selectedFuncId) ?? LAB_FUNCTIONS[0];

  const y0 = activeFunc.fn(x0);
  const slope = activeFunc.dfn(x0);

  // Secant calculations if enabled
  const xB = x0 + h;
  const yB = activeFunc.fn(xB);
  const secantSlope = (yB - y0) / h;

  // Viewport transforms (400x300 SVG)
  const [minX, maxX] = activeFunc.xRange;
  const [minY, maxY] = activeFunc.yRange;

  const toSvgX = (x: number) => 30 + ((x - minX) / (maxX - minX)) * 340;
  const toSvgY = (y: number) => 270 - ((y - minY) / (maxY - minY)) * 240;

  // Points for f(x)
  const curvePoints: string[] = [];
  const stepSize = (maxX - minX) / 80;
  for (let x = minX; x <= maxX; x += stepSize) {
    curvePoints.push(`${toSvgX(x)},${toSvgY(activeFunc.fn(x))}`);
  }
  const curvePathD = `M ${curvePoints.join(" L ")}`;

  // Points for f'(x)
  const derivPoints: string[] = [];
  for (let x = minX; x <= maxX; x += stepSize) {
    derivPoints.push(`${toSvgX(x)},${toSvgY(activeFunc.dfn(x))}`);
  }
  const derivPathD = `M ${derivPoints.join(" L ")}`;

  // Tangent line endpoints across canvas
  const ptAx = toSvgX(x0);
  const ptAy = toSvgY(y0);

  const tangX1 = minX;
  const tangY1 = y0 + slope * (tangX1 - x0);
  const tangX2 = maxX;
  const tangY2 = y0 + slope * (tangX2 - x0);

  // Interpretation of slope
  const getSlopeInterpretation = (m: number) => {
    if (Math.abs(m) < 0.05) {
      return {
        label: "Titik Stasioner (Mendatar / m = 0)",
        color: "text-amber-500",
        desc: "Kurva berada di puncak lokal, lembah lokal, atau titik belok mendatar.",
      };
    }
    if (m > 0) {
      return {
        label: `Menanjak Positif (m = +${m.toFixed(2)})`,
        color: "text-success",
        desc: "Nilai fungsi sedang bertambah seiring bertambahnya x (laju perubahan positif).",
      };
    }
    return {
      label: `Menurun Negatif (m = ${m.toFixed(2)})`,
      color: "text-danger",
      desc: "Nilai fungsi sedang berkurang seiring bertambahnya x (laju perubahan negatif).",
    };
  };

  const interpretation = getSlopeInterpretation(slope);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-muted text-accent">
          <span>Laboratorium Eksperimen</span>
          <span>•</span>
          <span>Nalar Lab Kalkulus</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight">
          Nalar Lab: Laboratorium Turunan Interaktif
        </h1>
        <p className="text-sm text-text-muted max-w-2xl leading-relaxed flex flex-wrap items-center gap-1">
          <span>Eksplorasi visual tanpa batas untuk memahami bagaimana kemiringan garis singgung berubah di setiap titik, serta melihat bagaimana kurva turunan</span>
          <MathRenderer inline content="$f'(x)$" />
          <span>merekam laju perubahan tersebut.</span>
        </p>
      </div>

      {/* Function Selection Tabs */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Pilih Fungsi Eksperimen:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LAB_FUNCTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setSelectedFuncId(f.id);
                setX0(f.defaultX);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedFuncId === f.id
                  ? "bg-accent-muted border-accent text-accent shadow-xs"
                  : "bg-surface-raised border-border text-text hover:bg-surface"
              }`}
            >
              <span className="text-xs font-bold block">{f.name}</span>
              <span className="text-xs text-text-muted mt-1 block">
                <MathRenderer inline content={`$${f.formulaKatex}$`} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Canvas & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Canvas */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-raised border border-border space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text">Kanvas Visualisasi</span>
              <span className="text-text-muted">•</span>
              <span className="font-mono text-accent">
                <MathRenderer inline content={`$${activeFunc.formulaKatex}$`} />
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-text-muted">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-text inline-block" />
                <MathRenderer inline content="$f(x)$" />
              </span>
              {showDerivativeCurve && (
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
                  <MathRenderer inline content="$f'(x)$" />
                </span>
              )}
            </div>
          </div>

          {/* SVG Viewport */}
          <div className="w-full aspect-[4/3] bg-surface rounded-xl border border-border relative overflow-hidden flex items-center justify-center select-none">
            <svg
              viewBox="0 0 400 300"
              className="w-full h-full"
              aria-label="Kanvas grafik fungsi dan garis singgung interaktif"
            >
              {/* Axes */}
              <line
                x1={toSvgX(minX)}
                y1={toSvgY(0)}
                x2={toSvgX(maxX)}
                y2={toSvgY(0)}
                stroke="var(--color-border)"
                strokeWidth="1.5"
              />
              <line
                x1={toSvgX(0)}
                y1={toSvgY(minY)}
                x2={toSvgX(0)}
                y2={toSvgY(maxY)}
                stroke="var(--color-border)"
                strokeWidth="1.5"
              />

              {/* f(x) Curve */}
              <path
                d={curvePathD}
                fill="none"
                stroke="var(--color-text)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* f'(x) Derivative Curve (Toggleable) */}
              {showDerivativeCurve && (
                <path
                  d={derivPathD}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
              )}

              {/* Tangent Line */}
              <line
                x1={toSvgX(tangX1)}
                y1={toSvgY(tangY1)}
                x2={toSvgX(tangX2)}
                y2={toSvgY(tangY2)}
                stroke="var(--color-success)"
                strokeWidth="2.5"
              />

              {/* Secant Line if enabled */}
              {showSecant && (
                <line
                  x1={toSvgX(x0 - 0.5)}
                  y1={toSvgY(y0 - 0.5 * secantSlope)}
                  x2={toSvgX(xB + 0.5)}
                  y2={toSvgY(yB + 0.5 * secantSlope)}
                  stroke="var(--color-warning)"
                  strokeWidth="1.5"
                />
              )}

              {/* Active Point (x0, y0) */}
              <circle cx={ptAx} cy={ptAy} r="6" fill="var(--color-success)" />

              {/* Moving Secant Point if enabled */}
              {showSecant && (
                <circle
                  cx={toSvgX(xB)}
                  cy={toSvgY(yB)}
                  r="5"
                  fill="var(--color-warning)"
                />
              )}
            </svg>
          </div>

          {/* Slider for Point x0 */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="lab-x-slider" className="font-semibold text-text flex items-center gap-1">
                <span>Posisikan Titik Singgung (</span>
                <MathRenderer inline content="$x_0$" />
                <span>):</span>
                <span className="font-mono text-accent font-bold text-sm ml-1">
                  {x0.toFixed(2)}
                </span>
              </label>
              <span className="text-text-muted">
                Geser untuk mengamati perubahan kemiringan
              </span>
            </div>

            <input
              id="lab-x-slider"
              type="range"
              min={minX + 0.1}
              max={maxX - 0.1}
              step={0.05}
              value={x0}
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="w-full accent-accent cursor-pointer h-2 bg-border rounded-lg"
              aria-label="Posisi titik singgung x nol"
            />
          </div>
        </div>

        {/* Live Metrics & Inspector Sidebar */}
        <div className="space-y-4">
          {/* Real-time Values Card */}
          <div className="p-5 rounded-2xl bg-surface-raised border border-border space-y-4">
            <h3 className="text-sm font-bold text-text">Inspektur Titik Singgung</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between">
                <span className="text-text-muted">Rumus Turunan:</span>
                <span className="text-accent font-semibold text-xs">
                  <MathRenderer inline content={`$${activeFunc.derivativeKatex}$`} />
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between">
                <span className="text-text-muted">Koordinat Titik:</span>
                <span className="font-mono font-bold text-text">
                  ({x0.toFixed(2)}, {y0.toFixed(2)})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-accent-muted border border-accent/30 flex items-center justify-between">
                <span className="text-accent font-semibold flex items-center gap-1">
                  <span>Kemiringan</span>
                  <MathRenderer inline content="$f'(x_0)$" />
                  <span>:</span>
                </span>
                <span className="font-mono font-bold text-accent text-base">
                  {slope.toFixed(3)}
                </span>
              </div>

              {/* Slope Interpretation Box */}
              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                <span className={`font-bold block ${interpretation.color}`}>
                  {interpretation.label}
                </span>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  {interpretation.desc}
                </p>
              </div>
            </div>

            {/* Toggle Controls */}
            <div className="space-y-2 pt-2 border-t border-border text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-text flex items-center gap-1">
                  <span>Tampilkan Kurva</span>
                  <MathRenderer inline content="$f'(x)$" />
                </span>
                <input
                  type="checkbox"
                  checked={showDerivativeCurve}
                  onChange={(e) => setShowDerivativeCurve(e.target.checked)}
                  className="rounded text-accent accent-accent w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-text flex items-center gap-1">
                  <span>Tampilkan Garis Secant (</span>
                  <MathRenderer inline content="$h$" />
                  <span>)</span>
                </span>
                <input
                  type="checkbox"
                  checked={showSecant}
                  onChange={(e) => setShowSecant(e.target.checked)}
                  className="rounded text-accent accent-accent w-4 h-4 cursor-pointer"
                />
              </label>

              {showSecant && (
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-[11px] text-text-muted items-center">
                    <span className="flex items-center gap-1">
                      <span>Jarak</span>
                      <MathRenderer inline content="$h$" />
                      <span>:</span>
                    </span>
                    <span className="font-mono font-bold">{h.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={1.5}
                    step={0.05}
                    value={h}
                    onChange={(e) => setH(parseFloat(e.target.value))}
                    className="w-full accent-accent cursor-pointer h-1.5 bg-border rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quick Return Link */}
          <div className="p-4 rounded-xl bg-surface border border-border text-xs space-y-2">
            <span className="font-semibold text-text block">Kembali ke Modul</span>
            <p className="text-text-muted text-[11px]">
              Terapkan intuisi yang kamu temukan di Lab ini pada modul pembelajaran interaktif.
            </p>
            <Link
              href="/modules/turunan"
              className="inline-block font-semibold text-accent hover:underline pt-1"
            >
              ← Buka Modul Turunan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
