"use client";

import React, { useState } from "react";
import { BatteryCharging, Flame, Sparkles, Sun } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

export function BiologicalEnergyPlayground() {
  const [mode, setMode] = useState<"respiration" | "photosynthesis" | "atp-cycle">("atp-cycle");
  const [substrateInput, setSubstrateInput] = useState<number>(3); // e.g. glucose moles or light intensity

  // Calculations
  // 1 mol glucose = ~32 ATP = ~2870 kJ
  const atpProduced = mode === "respiration" ? substrateInput * 32 : substrateInput * 18;
  const energyKj = substrateInput * 2870;

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-accent" />
            <span>Laboratorium Aliran Energi Hayati: ATP &amp; Transformasi Biokimia</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Jelajahi siklus termodinamika seluler: dari penangkapan foton cahaya hingga hidrolisis energi tinggi ATP.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
            Output: ~{atpProduced} Mol ATP
          </span>
        </div>
      </div>

      {/* Process Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { id: "atp-cycle", label: "Siklus ATP ⇌ ADP + Pi", icon: BatteryCharging },
          { id: "respiration", label: "Respirasi Seluler (Mitokondria)", icon: Flame },
          { id: "photosynthesis", label: "Fotosintesis (Kloroplas)", icon: Sun },
        ].map((m) => {
          const isActive = mode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id as "respiration" | "photosynthesis" | "atp-cycle")}
              className={`p-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-accent text-surface-raised border-accent shadow-xs"
                  : "bg-surface-raised border-border text-text hover:bg-surface"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Slider for Input Quantity */}
      <div className="bg-surface-raised p-4 rounded-xl border border-border space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-text">
          <span>{mode === "photosynthesis" ? "Intensitas Foton Cahaya / CO₂:" : "Bahan Baku Glukosa (Mol):"}</span>
          <span className="font-mono font-bold text-accent">{substrateInput} Unit</span>
        </div>
        <input
          type="range"
          min="1"
          max="6"
          step="1"
          value={substrateInput}
          onChange={(e) => setSubstrateInput(parseInt(e.target.value, 10))}
          className="w-full accent-accent cursor-pointer"
          aria-label="Atur kuantitas input energi biologis"
        />
      </div>

      {/* SVG Thermodynamic Cycle Canvas */}
      <div className="bg-surface-raised/50 p-5 rounded-xl border border-border flex flex-col items-center justify-center">
        <svg
          viewBox="0 0 420 180"
          className="w-full max-w-[420px] h-auto select-none"
          role="img"
          aria-label={`Diagram alir energi biokimia ${mode}`}
        >
          {mode === "atp-cycle" && (
            <g>
              {/* ATP High Energy State */}
              <rect x="30" y="30" width="130" height="50" rx="12" className="fill-accent/20 stroke-accent stroke-2" />
              <text x="95" y="55" textAnchor="middle" fontWeight="bold" fontSize="13" className="fill-text">
                ATP (Adenosin Trifosfat)
              </text>
              <text x="95" y="70" textAnchor="middle" fontSize="10" className="fill-accent font-mono font-bold">
                Tinggi Energi (3 Fosfat)
              </text>

              {/* Hydrolysis arrow (down right) */}
              <path d="M 165 45 C 230 20 270 45 280 65" fill="none" stroke="var(--color-danger)" strokeWidth="2.5" markerEnd="url(#arrow)" />
              <text x="230" y="32" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--color-danger)">
                Hidrolisis (-30.5 kJ/mol)
              </text>
              <text x="230" y="45" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">
                Energi untuk kerja sel
              </text>

              {/* ADP Low Energy State */}
              <rect x="250" y="95" width="140" height="50" rx="12" className="fill-surface border stroke-border stroke-2" />
              <text x="320" y="120" textAnchor="middle" fontWeight="bold" fontSize="12" className="fill-text">
                ADP + Pᵢ (Anorganik)
              </text>
              <text x="320" y="135" textAnchor="middle" fontSize="10" className="fill-text-muted font-mono">
                Rendah Energi (2 Fosfat)
              </text>

              {/* Phosphorylation arrow (up left) */}
              <path d="M 250 135 C 180 160 130 135 110 90" fill="none" stroke="var(--color-success)" strokeWidth="2.5" />
              <text x="175" y="160" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--color-success)">
                Fosforilasi (+ Energi Makanan)
              </text>
            </g>
          )}

          {mode === "respiration" && (
            <g>
              <rect x="30" y="65" width="140" height="50" rx="10" className="fill-amber-500/20 stroke-amber-500 stroke-2" />
              <text x="100" y="88" textAnchor="middle" fontWeight="bold" fontSize="11" className="fill-text">Glukosa + 6 O₂</text>
              <text x="100" y="103" textAnchor="middle" fontSize="9" className="fill-text-muted">Reaktan Makanan</text>

              {/* Arrow into Mitochondria */}
              <line x1="175" y1="90" x2="230" y2="90" stroke="var(--color-accent)" strokeWidth="2.5" />
              <text x="202" y="80" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--color-accent)">Mitokondria</text>

              <rect x="235" y="65" width="150" height="50" rx="10" className="fill-emerald-500/20 stroke-emerald-500 stroke-2" />
              <text x="310" y="88" textAnchor="middle" fontWeight="bold" fontSize="11" className="fill-text">6 CO₂ + 6 H₂O</text>
              <text x="310" y="103" textAnchor="middle" fontSize="9" className="fill-emerald-600 dark:text-emerald-400 font-bold">+ 32 ATP ({energyKj} kJ)</text>
            </g>
          )}

          {mode === "photosynthesis" && (
            <g>
              <rect x="30" y="65" width="140" height="50" rx="10" className="fill-cyan-500/20 stroke-cyan-500 stroke-2" />
              <text x="100" y="88" textAnchor="middle" fontWeight="bold" fontSize="11" className="fill-text">6 CO₂ + 6 H₂O</text>
              <text x="100" y="103" textAnchor="middle" fontSize="9" className="fill-text-muted">Bahan Baku Anorganik</text>

              {/* Arrow through Chloroplast powered by Sun */}
              <line x1="175" y1="90" x2="230" y2="90" stroke="var(--color-warning)" strokeWidth="2.5" />
              <text x="202" y="80" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--color-warning)">+ Foton Cahaya</text>

              <rect x="235" y="65" width="150" height="50" rx="10" className="fill-emerald-500/20 stroke-emerald-500 stroke-2" />
              <text x="310" y="88" textAnchor="middle" fontWeight="bold" fontSize="11" className="fill-text">Glukosa + 6 O₂</text>
              <text x="310" y="103" textAnchor="middle" fontSize="9" className="fill-emerald-600 dark:text-emerald-400 font-bold">Gula Kimiawi Organik</text>
            </g>
          )}
        </svg>
      </div>

      {/* Analytical Reasoning Card */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
        <div className="font-bold text-text text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Hukum Kekekalan Energi dalam Biosfer:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-muted leading-relaxed">
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">1. Mengapa ATP Disebut Mata Uang Energi Sel?</span>
            <p>
              Ikatan fosfoanhidrida antara gugus fosfat ke-2 dan ke-3 pada ATP memiliki muatan negatif yang saling bertolakan kuat. Pemutusan satu gugus fosfat (<MathRenderer inline content={`$\\text{ATP} + \\text{H}_2\\text{O} \\to \\text{ADP} + \\text{P}_i$`} />) melepaskan energi bebas <MathRenderer inline content={`$\\Delta G^\\circ = -30.5\\text{ kJ/mol}$`} /> yang langsung dapat menggerakkan pompa ion membran atau kontraksi protein otot.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">2. Siklus Komplementer Kloroplas dan Mitokondria:</span>
            <p>
              Produk buangan fotosintesis tumbuhan (<MathRenderer inline content={`$\\text{O}_2$`} /> dan karbohidrat) adalah reaktan vital bagi respirasi seluler mitokondria pada hewan, dan sebaliknya limbah respirasi (<MathRenderer inline content={`$\\text{CO}_2$`} />) diserap kembali oleh tumbuhan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
