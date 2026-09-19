"use client";

import React, { useState } from "react";
import { Activity, Sparkles } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

export function HarmonicOscillationPlayground() {
  const [mass, setMass] = useState<number>(2); // kg
  const [springK, setSpringK] = useState<number>(50); // N/m
  const [amplitude, setAmplitude] = useState<number>(0.3); // m
  const [posFrac, setPosFrac] = useState<number>(0.5); // position ratio -1 to +1

  // Physical calculations
  const omega = Math.sqrt(springK / mass);
  const period = (2 * Math.PI) / omega;
  const frequency = 1 / period;

  const currentX = posFrac * amplitude;
  const totalEnergy = 0.5 * springK * amplitude * amplitude;
  const potentialEnergy = 0.5 * springK * currentX * currentX;
  const kineticEnergy = Math.max(0, totalEnergy - potentialEnergy);

  const epPercent = totalEnergy > 0 ? (potentialEnergy / totalEnergy) * 100 : 0;
  const ekPercent = totalEnergy > 0 ? (kineticEnergy / totalEnergy) * 100 : 0;

  // SVG representation: mass block at x offset
  // Canvas width 450, height 160
  // Center equilibrium at x = 200
  const eqX = 200;
  const blockX = eqX + posFrac * 100;

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span>Laboratorium Osilasi Harmonik: Kekekalan Energi Mekanik</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Gerakkan posisi simpangan pegas untuk melihat pertukaran kontinu antara energi potensial pegas dan energi kinetik.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent font-bold">
            Periode T = {period.toFixed(2)} detik
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-raised p-4 rounded-xl border border-border">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Posisi Simpangan (x):</span>
            <span className="font-mono font-bold text-accent">{currentX.toFixed(2)} m</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={posFrac}
            onChange={(e) => setPosFrac(parseFloat(e.target.value))}
            className="w-full accent-accent cursor-pointer"
            aria-label="Atur simpangan posisi pegas x"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>-A (Tekan)</span>
            <span>0 (Setimbang)</span>
            <span>+A (Tarik)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Konstanta Pegas (k):</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{springK} N/m</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={springK}
            onChange={(e) => setSpringK(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
            aria-label="Atur konstanta pegas k"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Massa Beban (m):</span>
            <span className="font-mono font-bold text-text">{mass} kg</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={mass}
            onChange={(e) => setMass(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
            aria-label="Atur massa beban osilasi"
          />
        </div>
      </div>

      {/* SVG Canvas Spring and Block */}
      <div className="w-full aspect-[3/1] max-h-[180px] bg-surface-raised rounded-xl border border-border relative overflow-hidden flex items-center justify-center p-3">
        <svg
          viewBox="0 0 450 140"
          className="w-full h-full select-none"
          role="img"
          aria-label={`Visualisasi sistem osilasi pegas massa ${mass} kg simpangan ${currentX.toFixed(2)} meter`}
        >
          {/* Left Wall */}
          <line x1="40" y1="20" x2="40" y2="120" stroke="var(--color-border)" strokeWidth="4" />
          <line x1="40" y1="120" x2="420" y2="120" stroke="var(--color-border)" strokeWidth="2" />

          {/* Equilibrium reference line */}
          <line x1={eqX + 25} y1="20" x2={eqX + 25} y2="120" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <text x={eqX + 28} y="32" fontSize="9" fill="var(--color-accent)">
            x = 0
          </text>

          {/* Spring Zigzag from x=40 to blockX */}
          <polyline
            points={`40,80 70,70 90,90 110,70 130,90 150,70 170,90 ${blockX},80`}
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Oscillating Block */}
          <rect
            x={blockX}
            y="55"
            width="50"
            height="50"
            rx="6"
            className="fill-accent/20 stroke-accent stroke-2"
          />
          <text
            x={blockX + 25}
            y="85"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            className="fill-text font-mono"
          >
            {mass}kg
          </text>
        </svg>
      </div>

      {/* Energy Transformation Bars */}
      <div className="space-y-3 p-4 rounded-xl bg-surface-raised border border-border text-xs">
        <div className="flex justify-between items-center font-semibold text-text">
          <span>Kekekalan Energi Mekanik Total:</span>
          <span className="font-mono text-accent font-bold">{totalEnergy.toFixed(2)} Joule</span>
        </div>

        {/* Dual Energy Meter */}
        <div className="w-full h-4 rounded-full bg-surface border border-border overflow-hidden flex shadow-2xs">
          <div
            style={{ width: `${epPercent}%` }}
            className="h-full bg-amber-500 transition-all duration-200"
            title={`Energi Potensial Pegas: ${potentialEnergy.toFixed(2)} J (${epPercent.toFixed(0)}%)`}
          />
          <div
            style={{ width: `${ekPercent}%` }}
            className="h-full bg-emerald-500 transition-all duration-200"
            title={`Energi Kinetik: ${kineticEnergy.toFixed(2)} J (${ekPercent.toFixed(0)}%)`}
          />
        </div>

        <div className="flex justify-between text-[11px]">
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            Energi Potensial (<MathRenderer inline content="$E_p = \frac{1}{2}kx^2$" />): {potentialEnergy.toFixed(2)} J ({epPercent.toFixed(0)}%)
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Energi Kinetik (<MathRenderer inline content="$E_k = \frac{1}{2}mv^2$" />): {kineticEnergy.toFixed(2)} J ({ekPercent.toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Analytical Reasoning Card */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
        <div className="font-bold text-text text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Intisari Gerak Harmonik Sederhana (GHS):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-muted leading-relaxed">
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">1. Saat Berada di Titik Balik (x = &plusmn;A):</span>
            <p>
              Kecepatan sesaat bernilai nol sehingga energi kinetik <MathRenderer inline content={`$E_k = 0$`} />. Seluruh energi sistem tersimpan sebagai energi potensial pegas maksimum <MathRenderer inline content={`$E_p = \\frac{1}{2}kA^2$`} />.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">2. Saat Melewati Titik Setimbang (x = 0):</span>
            <p>
              Gaya pemulih bernilai nol dan energi potensial <MathRenderer inline content={`$E_p = 0$`} />. Seluruh energi berubah menjadi energi kinetik maksimum, menghasilkan kecepatan laju puncak <MathRenderer inline content={`$v_{\\max} = \\omega A$`} />.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
