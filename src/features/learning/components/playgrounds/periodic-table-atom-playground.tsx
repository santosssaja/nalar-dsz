"use client";

import React, { useState } from "react";
import { Atom, Sparkles } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

interface ElementData {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  period: number;
  group: number;
  electrons: number[]; // e.g. [2, 8, 1] for Na
}

const ELEMENTS: ElementData[] = [
  { z: 1, symbol: "H", name: "Hidrogen", mass: 1, period: 1, group: 1, electrons: [1] },
  { z: 2, symbol: "He", name: "Helium", mass: 4, period: 1, group: 18, electrons: [2] },
  { z: 3, symbol: "Li", name: "Litium", mass: 7, period: 2, group: 1, electrons: [2, 1] },
  { z: 4, symbol: "Be", name: "Berilium", mass: 9, period: 2, group: 2, electrons: [2, 2] },
  { z: 5, symbol: "B", name: "Boron", mass: 11, period: 2, group: 13, electrons: [2, 3] },
  { z: 6, symbol: "C", name: "Karbon", mass: 12, period: 2, group: 14, electrons: [2, 4] },
  { z: 7, symbol: "N", name: "Nitrogen", mass: 14, period: 2, group: 15, electrons: [2, 5] },
  { z: 8, symbol: "O", name: "Oksigen", mass: 16, period: 2, group: 16, electrons: [2, 6] },
  { z: 9, symbol: "F", name: "Fluorin", mass: 19, period: 2, group: 17, electrons: [2, 7] },
  { z: 10, symbol: "Ne", name: "Neon", mass: 20, period: 2, group: 18, electrons: [2, 8] },
  { z: 11, symbol: "Na", name: "Natrium", mass: 23, period: 3, group: 1, electrons: [2, 8, 1] },
  { z: 12, symbol: "Mg", name: "Magnesium", mass: 24, period: 3, group: 2, electrons: [2, 8, 2] },
  { z: 13, symbol: "Al", name: "Aluminium", mass: 27, period: 3, group: 13, electrons: [2, 8, 3] },
  { z: 14, symbol: "Si", name: "Silikon", mass: 28, period: 3, group: 14, electrons: [2, 8, 4] },
  { z: 15, symbol: "P", name: "Fosfor", mass: 31, period: 3, group: 15, electrons: [2, 8, 5] },
  { z: 16, symbol: "S", name: "Belerang", mass: 32, period: 3, group: 16, electrons: [2, 8, 6] },
  { z: 17, symbol: "Cl", name: "Klorin", mass: 35, period: 3, group: 17, electrons: [2, 8, 7] },
  { z: 18, symbol: "Ar", name: "Argon", mass: 40, period: 3, group: 18, electrons: [2, 8, 8] },
];

export function PeriodicTableAtomPlayground() {
  const [selectedZ, setSelectedZ] = useState<number>(6); // Carbon default

  const current = ELEMENTS.find((e) => e.z === selectedZ) ?? ELEMENTS[5];
  const protons = current.z;
  const neutrons = current.mass - current.z;
  const valenceElectrons = current.electrons[current.electrons.length - 1];

  // Shell radiuses for SVG: center (110, 110)
  const cx = 110;
  const cy = 110;
  const shellRadii = [35, 60, 85];

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <Atom className="w-4 h-4 text-accent" />
            <span>Simulasi Model Atom Bohr &amp; Konfigurasi Elektron</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Pilih unsur kimia untuk mengamati susunan partikel subatomik (proton, neutron, elektron) pada tiap kulit energi.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent font-bold">
            {current.name} ({current.symbol}) — Z={current.z}
          </span>
        </div>
      </div>

      {/* Element Selector Quick Pills */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-muted block">
          Pilih Unsur (Periode 1, 2, &amp; 3):
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ELEMENTS.map((el) => {
            const isSelected = el.z === selectedZ;
            return (
              <button
                key={el.z}
                type="button"
                onClick={() => setSelectedZ(el.z)}
                className={`w-9 h-9 rounded-lg font-mono text-xs font-bold border transition-all flex flex-col items-center justify-center leading-tight ${
                  isSelected
                    ? "bg-accent text-surface-raised border-accent shadow-xs scale-105"
                    : "bg-surface-raised border-border text-text hover:border-accent/60"
                }`}
                title={`${el.name} (Z = ${el.z})`}
              >
                <span className="text-[10px] opacity-70 leading-none">{el.z}</span>
                <span className="leading-none">{el.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Canvas: Bohr Model + Periodic Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-surface-raised/50 p-4 rounded-xl border border-border">
        {/* Bohr SVG Model */}
        <div className="flex flex-col items-center justify-center p-2">
          <svg
            viewBox="0 0 220 220"
            className="w-48 h-48 select-none"
            role="img"
            aria-label={`Model atom Bohr ${current.name} dengan ${protons} proton, ${neutrons} neutron, dan elektron kulit ${current.electrons.join(", ")}`}
          >
            {/* Electron Shells */}
            {current.electrons.map((_, shellIdx) => {
              const r = shellRadii[shellIdx];
              return (
                <circle
                  key={shellIdx}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
              );
            })}

            {/* Nucleus */}
            <circle cx={cx} cy={cy} r={18} className="fill-amber-500/20 stroke-amber-500 stroke-2" />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              className="fill-text font-mono font-bold text-[10px]"
            >
              {current.symbol}
            </text>

            {/* Electrons on each shell */}
            {current.electrons.map((count, shellIdx) => {
              const r = shellRadii[shellIdx];
              return Array.from({ length: count }).map((_, eIdx) => {
                const angle = (eIdx / count) * 2 * Math.PI - Math.PI / 2;
                const ex = cx + r * Math.cos(angle);
                const ey = cy + r * Math.sin(angle);
                return (
                  <circle
                    key={`${shellIdx}-${eIdx}`}
                    cx={ex}
                    cy={ey}
                    r={3.5}
                    className="fill-accent stroke-surface stroke-1 shadow-2xs"
                  />
                );
              });
            })}
          </svg>

          <span className="text-xs font-mono text-text-muted mt-1">
            Kulit K={current.electrons[0] || 0}
            {current.electrons[1] ? `, L=${current.electrons[1]}` : ""}
            {current.electrons[2] ? `, M=${current.electrons[2]}` : ""}
          </span>
        </div>

        {/* Atomic Particle Ledger */}
        <div className="space-y-3 p-2 text-xs">
          <div className="p-3 rounded-xl bg-surface border border-border space-y-2">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <span className="text-text-muted">Nomor Atom (Z = Proton = Elektron):</span>
              <span className="font-mono font-bold text-accent">{protons}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <span className="text-text-muted">Nomor Massa (A = Proton + Neutron):</span>
              <span className="font-mono font-bold text-text">{current.mass}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <span className="text-text-muted">Jumlah Neutron (A - Z):</span>
              <span className="font-mono font-bold text-text">{neutrons}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Elektron Valensi (Kulit Terluar):</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {valenceElectrons} (Golongan {current.group})
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-accent-muted/20 border border-accent/30 text-[11px] text-text">
            <strong>Penempatan Sistem Periodik:</strong> Periode {current.period} (memiliki {current.electrons.length} kulit terisi), Golongan {current.group}.
          </div>
        </div>
      </div>

      {/* Analytical Reasoning Card */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
        <div className="font-bold text-text text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Aturan Konfigurasi Elektron &amp; Kestabilan:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-muted leading-relaxed">
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">1. Kapasitas Maksimum Kulit (2n²):</span>
            <p>
              Kulit ke-1 (K) hanya mampu menampung <MathRenderer inline content={`$2(1)^2 = 2$`} /> elektron, kulit ke-2 (L) menampung <MathRenderer inline content={`$2(2)^2 = 8$`} /> elektron, dan kulit ke-3 (M) menampung hingga 8 elektron pada periode 3 sebelum terisi ke subkulit berikutnya.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">2. Mengapa Elektron Valensi Menentukan Sifat Kimia?</span>
            <p>
              Elektron pada kulit terluar yang paling jauh dari inti adalah yang berinteraksi saat pembentukan ikatan. Unsur seperti Natrium (1 elektron valensi) cenderung melepas elektron, sedangkan Klorin (7 elektron valensi) cenderung menangkap 1 elektron demi mencapai kestabilan oktet (8 elektron seperti gas mulia Neon/Argon).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
