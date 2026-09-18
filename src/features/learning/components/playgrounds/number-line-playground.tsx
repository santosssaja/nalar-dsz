"use client";

import React, { useState } from "react";
import { Ruler } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

export function NumberLinePlayground() {
  const [pointA, setPointA] = useState<number>(-5);
  const [pointB, setPointB] = useState<number>(3);

  // Range: -10 to +10
  // SVG Width 600, Height 180
  // Scale: x in [-10, 10] -> SVG X in [50, 550]
  const toSvgX = (val: number) => 50 + ((val + 10) / 20) * 500;
  const zeroX = toSvgX(0);

  const ax = toSvgX(pointA);
  const bx = toSvgX(pointB);

  const magA = Math.abs(pointA);
  const magB = Math.abs(pointB);

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <Ruler className="w-4 h-4 text-accent" />
            <span>Garis Bilangan Interaktif: Magnitude vs Arah</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Geser titik A dan B untuk membuktikan mengapa posisi lebih ke kiri bernilai lebih kecil, terlepas dari jaraknya dari nol.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent font-bold">
            Titik A = {pointA}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
            Titik B = {pointB}
          </span>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-raised p-4 rounded-xl border border-border">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Posisi Titik A:</span>
            <span className="font-mono font-bold text-accent">{pointA}</span>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="1"
            value={pointA}
            onChange={(e) => setPointA(parseInt(e.target.value, 10))}
            className="w-full accent-accent cursor-pointer"
            aria-label="Atur posisi titik A pada garis bilangan"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>-10 (Kiri)</span>
            <span>0 (Acuan)</span>
            <span>+10 (Kanan)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Posisi Titik B:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{pointB}</span>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="1"
            value={pointB}
            onChange={(e) => setPointB(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
            aria-label="Atur posisi titik B pada garis bilangan"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>-10 (Kiri)</span>
            <span>0 (Acuan)</span>
            <span>+10 (Kanan)</span>
          </div>
        </div>
      </div>

      {/* Number Line SVG Canvas */}
      <div className="overflow-x-auto bg-surface-raised/60 p-4 rounded-xl border border-border flex justify-center">
        <svg
          viewBox="0 0 600 160"
          className="w-full max-w-[600px] h-auto select-none"
          role="img"
          aria-label="Visualisasi garis bilangan horizontal dengan titik A dan titik B"
        >
          {/* Main Axis Line */}
          <line
            x1="30"
            y1="80"
            x2="570"
            y2="80"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-border"
          />
          {/* Left arrow */}
          <polygon points="25,80 35,75 35,85" fill="currentColor" className="text-border" />
          {/* Right arrow */}
          <polygon points="575,80 565,75 565,85" fill="currentColor" className="text-border" />

          {/* Tick Marks & Labels */}
          {[-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10].map((val) => {
            const x = toSvgX(val);
            const isZero = val === 0;
            return (
              <g key={val}>
                <line
                  x1={x}
                  y1={isZero ? 68 : 74}
                  x2={x}
                  y2={isZero ? 92 : 86}
                  stroke="currentColor"
                  strokeWidth={isZero ? 3 : 1.5}
                  className={isZero ? "text-accent" : "text-border"}
                />
                <text
                  x={x}
                  y="108"
                  textAnchor="middle"
                  fontSize={isZero ? 13 : 10}
                  fontWeight={isZero ? "bold" : "normal"}
                  fill="currentColor"
                  className={isZero ? "text-accent font-bold" : "text-text-muted"}
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Distance / Magnitude Vector from 0 to A */}
          {pointA !== 0 && (
            <g>
              <line
                x1={zeroX}
                y1="45"
                x2={ax}
                y2="45"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="text-accent"
              />
              <text
                x={(zeroX + ax) / 2}
                y="38"
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="currentColor"
                className="text-accent"
              >
                Jarak |{pointA}| = {magA}
              </text>
            </g>
          )}

          {/* Distance / Magnitude Vector from 0 to B */}
          {pointB !== 0 && (
            <g>
              <line
                x1={zeroX}
                y1="135"
                x2={bx}
                y2="135"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="text-emerald-500"
              />
              <text
                x={(zeroX + bx) / 2}
                y="150"
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="currentColor"
                className="text-emerald-600 dark:text-emerald-400"
              >
                Jarak |{pointB}| = {magB}
              </text>
            </g>
          )}

          {/* Point A Marker */}
          <circle cx={ax} cy="80" r="7" className="fill-accent stroke-surface stroke-2 shadow-xs" />
          <text
            x={ax}
            y="65"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="currentColor"
            className="text-accent font-bold"
          >
            A ({pointA})
          </text>

          {/* Point B Marker */}
          <circle
            cx={bx}
            cy="80"
            r="7"
            className="fill-emerald-500 stroke-surface stroke-2 shadow-xs"
          />
          <text
            x={bx}
            y="65"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="currentColor"
            className="text-emerald-600 dark:text-emerald-400 font-bold"
          >
            B ({pointB})
          </text>
        </svg>
      </div>

      {/* Analytical Comparison Insight Card */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
        <div className="font-bold text-text text-sm flex items-center justify-between">
          <span>Hasil Komparasi Matematis:</span>
          <span className="font-mono px-2.5 py-1 rounded bg-surface border border-border">
            {pointA === pointB
              ? "A sama dengan B (A = B)"
              : pointA < pointB
              ? `Titik A < Titik B (${pointA} < ${pointB})`
              : `Titik A > Titik B (${pointA} > ${pointB})`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-text-muted leading-relaxed">
          <div className="p-2.5 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">1. Dimensi Magnitude (Jarak Mutlak):</span>
            <p>
              Jarak Titik A dari nol adalah <strong>|{pointA}| = {magA} satuan</strong>.<br />
              Jarak Titik B dari nol adalah <strong>|{pointB}| = {magB} satuan</strong>.<br />
              {magA > magB
                ? `Jarak A ke nol lebih jauh daripada B.`
                : magA < magB
                ? `Jarak B ke nol lebih jauh daripada A.`
                : `Kedua titik berjarak sama dari titik nol.`}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">2. Dimensi Posisi & Arah (Nilai Riil):</span>
            <p>
              {pointA < pointB ? (
                <>
                  Karena Titik A (<span className="text-accent font-bold">{pointA}</span>) berada lebih ke <strong>kiri</strong> daripada Titik B (<span className="text-emerald-600 dark:text-emerald-400 font-bold">{pointB}</span>), maka <strong>{pointA} lebih kecil daripada {pointB}</strong>.
                </>
              ) : pointA > pointB ? (
                <>
                  Karena Titik A (<span className="text-accent font-bold">{pointA}</span>) berada lebih ke <strong>kanan</strong> daripada Titik B (<span className="text-emerald-600 dark:text-emerald-400 font-bold">{pointB}</span>), maka <strong>{pointA} lebih besar daripada {pointB}</strong>.
                </>
              ) : (
                <>Kedua titik berada tepat di posisi yang sama.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
