"use client";

import React, { useState } from "react";
import { Grid, Sparkles, TrendingUp } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

export function PatternExponentPlayground() {
  const [n, setN] = useState<number>(4);
  const [base, setBase] = useState<number>(2);

  // Calculations
  const linearVal = base * n;
  const quadraticVal = n * n;
  const exponentialVal = Math.pow(base, n);

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span>Visualisasi Pola, Pangkat, &amp; Pertumbuhan Eksponensial</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Bandingkan bagaimana pola linier, kuadratik, dan eksponensial meledak pada tingkat pertumbuhan yang sangat berbeda.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent font-bold">
            {base}^{n} = {exponentialVal}
          </span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-raised p-4 rounded-xl border border-border">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Langkah / Eksponen (n):</span>
            <span className="font-mono font-bold text-accent">{n}</span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={n}
            onChange={(e) => setN(parseInt(e.target.value, 10))}
            className="w-full accent-accent cursor-pointer"
            aria-label="Atur nilai eksponen n"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>n = 1</span>
            <span>n = 6</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Basis Perkalian (b):</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{base}</span>
          </div>
          <input
            type="range"
            min="2"
            max="4"
            step="1"
            value={base}
            onChange={(e) => setBase(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
            aria-label="Atur basis bilangan berpangkat"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>Basis 2 (Biner)</span>
            <span>Basis 4</span>
          </div>
        </div>
      </div>

      {/* Visual Canvas: Growth Comparison Bars & Geometric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-raised/50 p-4 rounded-xl border border-border">
        {/* Comparison Bars */}
        <div className="space-y-3.5 p-2">
          <span className="text-xs font-bold text-text flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-accent" />
            <span>Perbandingan Nilai pada Langkah n = {n}:</span>
          </span>

          {/* Linear Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">1. Linier (<MathRenderer inline content={`$b \\cdot n = ${base} \\times ${n}$`} />):</span>
              <span className="font-mono font-bold text-text">{linearVal}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface border border-border overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (linearVal / Math.max(exponentialVal, 64)) * 100)}%` }}
                className="h-full bg-indigo-400 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Quadratic Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">2. Kuadratik (<MathRenderer inline content={`$n^2 = ${n}^2$`} />):</span>
              <span className="font-mono font-bold text-text">{quadraticVal}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface border border-border overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (quadraticVal / Math.max(exponentialVal, 64)) * 100)}%` }}
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Exponential Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-accent font-semibold">3. Eksponensial (<MathRenderer inline content={`$b^n = ${base}^{${n}}$`} />):</span>
              <span className="font-mono font-bold text-accent">{exponentialVal}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface border border-border overflow-hidden">
              <div
                style={{ width: "100%" }}
                className="h-full bg-accent rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Geometric Grid of Square vs Power */}
        <div className="flex flex-col items-center justify-center p-2">
          <span className="text-xs font-semibold text-text mb-2">
            Representasi Geometris Luas Persegi (<MathRenderer inline content={`$${n} \\times ${n} = ${quadraticVal}$`} /> sel):
          </span>
          <div
            className="grid gap-1 p-2 rounded-xl bg-surface border border-border max-w-[160px] max-h-[160px] aspect-square"
            style={{
              gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`,
            }}
            role="img"
            aria-label={`Grid geometris ${n} kali ${n} sel`}
          >
            {Array.from({ length: quadraticVal }).map((_, i) => (
              <div
                key={i}
                className="w-full h-full min-w-3 min-h-3 rounded-xs bg-amber-500/40 border border-amber-500/60"
              />
            ))}
          </div>
          <span className="text-[11px] text-text-muted mt-2 text-center">
            Akar kuadrat <MathRenderer inline content={`$\\sqrt{${quadraticVal}} = ${n}$`} /> adalah panjang sisi geometri persegi ini.
          </span>
        </div>
      </div>

      {/* Analytical Reasoning Card */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
        <div className="font-bold text-text text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Prinsip Pertumbuhan &amp; Logika Pangkat:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-muted leading-relaxed">
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">1. Perkalian Berulang vs Penjumlahan Berulang:</span>
            <p>
              Operasi linier <MathRenderer inline content={`$${base} \\times ${n}$`} /> adalah penjumlahan <MathRenderer inline content={`$${base}$`} /> sebanyak <MathRenderer inline content={`$${n}$`} /> kali. Sedangkan pangkat <MathRenderer inline content={`$${base}^{${n}}$`} /> adalah pelipatan kuantitas secara berganda (perkalian berulang), menghasilkan pertumbuhan kurva melengkung ke atas (*hockey stick*).
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">2. Akar sebagai Operasi Balikan (Invers):</span>
            <p>
              Jika <MathRenderer inline content={`$${n}^2 = ${quadraticVal}$`} />, maka akar pangkat dua <MathRenderer inline content={`$\\sqrt{${quadraticVal}} = ${n}$`} /> menjawab pertanyaan: &quot;Berapa panjang sisi yang jika membentuk bidang persegi akan memiliki luas {quadraticVal}?&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
