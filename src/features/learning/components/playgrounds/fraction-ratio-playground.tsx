"use client";

import React, { useState } from "react";
import { PieChart, Sparkles } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

export function FractionRatioPlayground() {
  const [partA, setPartA] = useState<number>(3);
  const [partB, setPartB] = useState<number>(5);
  const [multiplier, setMultiplier] = useState<number>(2);

  // Calculations
  const total = partA + partB;
  const percentA = total > 0 ? (partA / total) * 100 : 0;
  const percentB = total > 0 ? (partB / total) * 100 : 0;

  // GCD for simplified ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(partA, partB);
  const simplifiedA = partA / divisor;
  const simplifiedB = partB / divisor;

  // Scaled values
  const scaledA = partA * multiplier;
  const scaledB = partB * multiplier;
  const scaledTotal = scaledA + scaledB;

  // Pie angles (in degrees, total 360)
  const angleA = (percentA / 100) * 360;

  // SVG Pie coordinates: center (100, 100), radius 70
  const cx = 100;
  const cy = 100;
  const r = 70;

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(0));
  const y1 = cy + r * Math.sin(toRad(0));
  const x2 = cx + r * Math.cos(toRad(angleA));
  const y2 = cy + r * Math.sin(toRad(angleA));
  const largeArcFlag = angleA > 180 ? 1 : 0;

  const pathA = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <PieChart className="w-4 h-4 text-accent" />
            <span>Visualisasi Rasio, Proporsi, &amp; Persentase</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Ubah pembagian kuantitas dan faktor pengali untuk melihat invariansi rasio dan hubungan bagian-terhadap-utuh.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent font-bold">
            Rasio = {simplifiedA} : {simplifiedB}
          </span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-raised p-4 rounded-xl border border-border">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Kuantitas Bagian A:</span>
            <span className="font-mono font-bold text-accent">{partA}</span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={partA}
            onChange={(e) => setPartA(parseInt(e.target.value, 10))}
            className="w-full accent-accent cursor-pointer"
            aria-label="Atur kuantitas bagian A"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Kuantitas Bagian B:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{partB}</span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={partB}
            onChange={(e) => setPartB(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
            aria-label="Atur kuantitas bagian B"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Faktor Pengali Proporsi (k):</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{multiplier}&times;</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={multiplier}
            onChange={(e) => setMultiplier(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer"
            aria-label="Atur faktor pengali proporsi k"
          />
        </div>
      </div>

      {/* Visual Canvas: Bar and Pie Representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-surface-raised/50 p-4 rounded-xl border border-border">
        {/* Pie Diagram */}
        <div className="flex flex-col items-center justify-center p-2">
          <svg
            viewBox="0 0 200 200"
            className="w-40 h-40 select-none drop-shadow-xs"
            role="img"
            aria-label={`Diagram lingkaran proporsi: Bagian A ${percentA.toFixed(1)}%, Bagian B ${percentB.toFixed(1)}%`}
          >
            {/* Background Full Circle (Part B) */}
            <circle cx={cx} cy={cy} r={r} className="fill-emerald-500/80 stroke-surface stroke-2" />
            {/* Slice for Part A */}
            {angleA > 0 && angleA < 360 && (
              <path d={pathA} className="fill-accent stroke-surface stroke-2" />
            )}
            {angleA >= 360 && (
              <circle cx={cx} cy={cy} r={r} className="fill-accent stroke-surface stroke-2" />
            )}
            {/* Center donut hole */}
            <circle cx={cx} cy={cy} r={32} className="fill-surface stroke-border stroke-1" />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              className="fill-text font-mono font-bold text-xs"
            >
              100%
            </text>
          </svg>
          <div className="flex items-center gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-text font-medium">A: {percentA.toFixed(1)}%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-text font-medium">B: {percentB.toFixed(1)}%</span>
            </span>
          </div>
        </div>

        {/* Linear Proportional Strip */}
        <div className="space-y-4 p-2">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-text">
              <span>Bilah Proporsi Relatif ({partA} : {partB})</span>
              <span className="text-text-muted">Total Bagian = {total}</span>
            </div>
            <div className="w-full h-8 rounded-xl bg-surface border border-border overflow-hidden flex shadow-2xs">
              <div
                style={{ width: `${percentA}%` }}
                className="bg-accent flex items-center justify-center text-[11px] font-bold text-surface-raised transition-all"
              >
                {percentA > 15 ? `A (${partA})` : ""}
              </div>
              <div
                style={{ width: `${percentB}%` }}
                className="bg-emerald-500 flex items-center justify-center text-[11px] font-bold text-surface-raised transition-all"
              >
                {percentB > 15 ? `B (${partB})` : ""}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-text">
              <span>Skala Proporsional Teramplifikasi ({multiplier}&times;)</span>
              <span className="text-text-muted font-mono">{scaledA} : {scaledB} (Total = {scaledTotal})</span>
            </div>
            <div className="w-full h-8 rounded-xl bg-surface border border-border overflow-hidden flex shadow-2xs">
              <div
                style={{ width: `${percentA}%` }}
                className="bg-accent/80 border-r border-surface flex items-center justify-center text-[11px] font-bold text-surface-raised transition-all"
              >
                {percentA > 15 ? `${scaledA}` : ""}
              </div>
              <div
                style={{ width: `${percentB}%` }}
                className="bg-emerald-500/80 flex items-center justify-center text-[11px] font-bold text-surface-raised transition-all"
              >
                {percentB > 15 ? `${scaledB}` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Reasoning Card */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
        <div className="font-bold text-text text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Hukum Invariansi Rasio &amp; Kesebangunan Proporsi:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-muted leading-relaxed">
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">1. Rasio Tak Bergantung pada Ukuran Mutlak:</span>
            <p>
              Meskipun kuantitas dikalikan <MathRenderer inline content={`$${multiplier}\\times$`} /> menjadi <MathRenderer inline content={`$${scaledA}:${scaledB}$`} />, nilai pecahannya tetap identik: <MathRenderer inline content={`$\\frac{${scaledA}}{${scaledB}} = \\frac{${partA}}{${partB}} = \\frac{${simplifiedA}}{${simplifiedB}}$`} />.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">2. Persentase Bagian-Terhadap-Utuh:</span>
            <p>
              Bagian A mewakili <MathRenderer inline content={`$\\frac{${partA}}{${total}} \\times 100\\% = ${percentA.toFixed(1)}\\%$`} /> dari keseluruhan, membuktikan persentase adalah rasio dengan penyebut acuan 100.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
