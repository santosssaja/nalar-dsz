"use client";

import React, { useState } from "react";
import { FlaskConical, Snowflake, Droplets, Wind } from "lucide-react";

export function MatterPlayground() {
  const [temperature, setTemperature] = useState<number>(25);

  const isSolid = temperature < 0;
  const isLiquid = temperature >= 0 && temperature < 100;
  const isGas = temperature >= 100;

  const phaseName = isSolid ? "Padat (Solid)" : isLiquid ? "Cair (Liquid)" : "Gas (Vapor)";
  const phaseColor = isSolid ? "text-cyan-500" : isLiquid ? "text-blue-500" : "text-amber-500";
  const phaseBg = isSolid ? "bg-cyan-500/15" : isLiquid ? "bg-blue-500/15" : "bg-amber-500/15";

  // Generate 25 particle coordinates based on phase
  const particles: Array<{ cx: number; cy: number; r: number }> = [];

  if (isSolid) {
    // Tightly packed lattice grid
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 6; col++) {
        const jitter = (Math.sin(row * 13 + col * 7) * (temperature + 55)) / 70;
        particles.push({
          cx: 140 + col * 26 + jitter,
          cy: 90 + row * 24 + jitter,
          r: 9,
        });
      }
    }
  } else if (isLiquid) {
    // Settled at bottom of container, flowing closely
    for (let i = 0; i < 30; i++) {
      const col = i % 7;
      const row = Math.floor(i / 7);
      const shiftX = Math.sin(i * 3) * 6;
      const shiftY = Math.cos(i * 5) * 4;
      particles.push({
        cx: 130 + col * 22 + shiftX,
        cy: 110 + row * 18 + shiftY,
        r: 8.5,
      });
    }
  } else {
    // Dispersed everywhere in gas phase
    const gasPoints = [
      { x: 120, y: 40 }, { x: 190, y: 35 }, { x: 250, y: 45 }, { x: 150, y: 75 },
      { x: 220, y: 70 }, { x: 270, y: 80 }, { x: 115, y: 110 }, { x: 175, y: 115 },
      { x: 240, y: 120 }, { x: 130, y: 150 }, { x: 200, y: 155 }, { x: 265, y: 160 },
      { x: 160, y: 175 }, { x: 225, y: 180 }, { x: 280, y: 185 }
    ];
    for (const pt of gasPoints) {
      particles.push({ cx: pt.x, cy: pt.y, r: 8 });
    }
  }

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-accent" />
            <span>Simulasi Kinetik Partikel Wujud Zat</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Ubah suhu energi termal untuk melihat bagaimana gaya tarik antarmolekul bersaing dengan energi gerak partikel.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`px-2.5 py-1 rounded-md font-bold ${phaseBg} ${phaseColor}`}>
            Wujud: {phaseName} ({temperature}°C)
          </span>
        </div>
      </div>

      {/* Temperature Slider */}
      <div className="space-y-2 bg-surface-raised p-4 rounded-xl border border-border">
        <div className="flex justify-between text-xs font-medium text-text">
          <span>Pengatur Suhu Termal Wadah:</span>
          <span className="font-mono font-bold text-accent">{temperature}°C</span>
        </div>
        <input
          type="range"
          min="-50"
          max="150"
          step="5"
          value={temperature}
          onChange={(e) => setTemperature(parseInt(e.target.value, 10))}
          className="w-full accent-accent cursor-pointer"
          aria-label="Atur suhu zat"
        />
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>-50°C (Membeku)</span>
          <span>0°C (Titik Lebur)</span>
          <span>100°C (Titik Didih)</span>
          <span>150°C (Gas)</span>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-text-muted font-medium">Preset Wujud:</span>
        <button
          type="button"
          onClick={() => setTemperature(-25)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            isSolid ? "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold" : "bg-surface border-border text-text"
          }`}
        >
          <Snowflake className="w-3.5 h-3.5" />
          <span>Padat / Es (-25°C)</span>
        </button>
        <button
          type="button"
          onClick={() => setTemperature(25)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            isLiquid ? "bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400 font-bold" : "bg-surface border-border text-text"
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Cair / Air (25°C)</span>
        </button>
        <button
          type="button"
          onClick={() => setTemperature(125)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            isGas ? "bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-bold" : "bg-surface border-border text-text"
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Gas / Uap (125°C)</span>
        </button>
      </div>

      {/* SVG Container Simulation */}
      <div className="overflow-x-auto bg-surface-raised/60 p-4 rounded-xl border border-border flex justify-center">
        <svg
          viewBox="0 0 400 230"
          className="w-full max-w-[400px] h-auto select-none"
          role="img"
          aria-label="Wadah kaca transparan berisi partikel zat yang bergetar sesuai wujudnya"
        >
          {/* Glass Beaker Container */}
          <rect x="90" y="25" width="220" height="180" rx="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
          <line x1="80" y1="25" x2="105" y2="25" stroke="currentColor" strokeWidth="4" className="text-border" />
          <line x1="295" y1="25" x2="320" y2="25" stroke="currentColor" strokeWidth="4" className="text-border" />

          {/* Volume Fill Hint for Liquid */}
          {isLiquid && (
            <rect x="93" y="100" width="214" height="102" rx="8" className="fill-blue-500/10" />
          )}

          {/* Render Particles */}
          {particles.map((p, i) => (
            <circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              className={`transition-all duration-300 stroke-surface stroke-1 ${
                isSolid
                  ? "fill-cyan-500 shadow-xs"
                  : isLiquid
                  ? "fill-blue-500 shadow-xs"
                  : "fill-amber-500 shadow-xs"
              }`}
            />
          ))}

          {/* Status Overlay */}
          <text x="200" y="220" textAnchor="middle" fontSize="11" fontWeight="bold" className="fill-text-muted">
            {isSolid
              ? "Kisi Teratur: Bergetar pada posisi tetap"
              : isLiquid
              ? "Bebas Meluncur: Bentuk menyesuaikan wadah"
              : "Gerak Bebas Cepat: Memenuhi seluruh ruang wadah"}
          </text>
        </svg>
      </div>

      {/* Analytical Table Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs leading-relaxed">
        <div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
          <span className="font-bold text-text block">Bentuk (Shape):</span>
          <p className="text-text-muted">
            {isSolid ? "Tetap, mempertahankan bentuknya sendiri." : isLiquid ? "Berubah mengikuti bentuk wadahnya." : "Berubah bebas memenuhi seluruh volume ruangan."}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
          <span className="font-bold text-text block">Volume:</span>
          <p className="text-text-muted">
            {isSolid ? "Tetap, partikel terikat sangat rapat." : isLiquid ? "Tetap, tidak menyusut atau membesar." : "Berubah-ubah sesuai ukuran ruang yang tersedia."}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
          <span className="font-bold text-text block">Kompresibilitas:</span>
          <p className="text-text-muted">
            {isSolid ? "Sangat sulit ditekan (hampir inkompresibel)." : isLiquid ? "Sangat sulit ditekan." : "Sangat mudah ditekan (kompresibel tinggi)."}
          </p>
        </div>
      </div>
    </div>
  );
}
