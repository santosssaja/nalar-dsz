"use client";

import React, { useState } from "react";
import { FlaskConical, Sparkles } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

interface MoleculeExample {
  id: string;
  name: string;
  formula: string;
  type: "ionik" | "kovalen-polar" | "kovalen-nonpolar";
  geometry: string;
  bondAngle: string;
  description: string;
}

const MOLECULES: MoleculeExample[] = [
  {
    id: "nacl",
    name: "Natrium Klorida",
    formula: "NaCl",
    type: "ionik",
    geometry: "Kisi Kristal Kubik",
    bondAngle: "90° (Ortogonal Kisi)",
    description: "Transfer 1 elektron penuh dari Na ke Cl membentuk kation Na⁺ dan anion Cl⁻ dengan gaya elektrostatik kuat.",
  },
  {
    id: "h2o",
    name: "Air",
    formula: "H₂O",
    type: "kovalen-polar",
    geometry: "Bengkok (Bent / V-Shape)",
    bondAngle: "104.5°",
    description: "Dua ikatan kovalen tunggal O-H dengan 2 pasang elektron bebas (PEB) pada atom Oksigen yang menolak ikatan ke bawah.",
  },
  {
    id: "co2",
    name: "Karbon Dioksida",
    formula: "CO₂",
    type: "kovalen-nonpolar",
    geometry: "Linear (Garis Lurus)",
    bondAngle: "180°",
    description: "Dua ikatan rangkap dua O=C=O tanpa pasangan elektron bebas pada atom pusat Karbon, menghasilkan momen dipol nol.",
  },
  {
    id: "ch4",
    name: "Metana",
    formula: "CH₄",
    type: "kovalen-nonpolar",
    geometry: "Tetrahedral",
    bondAngle: "109.5°",
    description: "Empat ikatan kovalen C-H tersusun simetris dalam ruang 3 dimensi meminimalkan tolakan pasangan elektron (teori VSEPR).",
  },
];

export function ChemicalBondingPlayground() {
  const [selectedId, setSelectedId] = useState<string>("h2o");

  const activeMol = MOLECULES.find((m) => m.id === selectedId) ?? MOLECULES[1];

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-accent" />
            <span>Laboratorium Ikatan Kimia &amp; Geometri Molekul (VSEPR)</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Pelajari bagaimana aturan oktet, pasangan elektron bebas (PEB), dan perbedaan keelektronegatifan membentuk arsitektur ruang molekul.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-accent/15 text-accent font-bold">
            {activeMol.formula} ({activeMol.geometry})
          </span>
        </div>
      </div>

      {/* Molecule Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MOLECULES.map((m) => {
          const isActive = m.id === selectedId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedId(m.id)}
              className={`p-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                isActive
                  ? "bg-accent text-surface-raised border-accent shadow-xs"
                  : "bg-surface-raised border-border text-text hover:bg-surface"
              }`}
            >
              <span className="font-mono text-sm">{m.formula}</span>
              <span className="text-[11px] opacity-80">{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Canvas: Lewis Structure / Geometric Representation */}
      <div className="bg-surface-raised/50 p-5 rounded-xl border border-border flex flex-col md:flex-row items-center justify-around gap-6">
        <div className="flex flex-col items-center justify-center p-3">
          <svg
            viewBox="0 0 240 180"
            className="w-56 h-40 select-none"
            role="img"
            aria-label={`Representasi geometri molekul ${activeMol.name} ${activeMol.formula} bentuk ${activeMol.geometry}`}
          >
            {selectedId === "h2o" && (
              <g>
                {/* O center atom */}
                <circle cx="120" cy="80" r="22" className="fill-danger/20 stroke-danger stroke-2" />
                <text x="120" y="85" textAnchor="middle" fontWeight="bold" fontSize="14" className="fill-text">
                  O
                </text>
                {/* Lone pairs on Oxygen */}
                <circle cx="110" cy="50" r="3" className="fill-accent" />
                <circle cx="118" cy="47" r="3" className="fill-accent" />
                <circle cx="130" cy="50" r="3" className="fill-accent" />
                <circle cx="138" cy="47" r="3" className="fill-accent" />
                {/* H atoms */}
                <line x1="104" y1="94" x2="65" y2="130" stroke="var(--color-text)" strokeWidth="2.5" />
                <circle cx="60" cy="135" r="16" className="fill-accent/20 stroke-accent stroke-2" />
                <text x="60" y="140" textAnchor="middle" fontWeight="bold" fontSize="12" className="fill-text">
                  H
                </text>

                <line x1="136" y1="94" x2="175" y2="130" stroke="var(--color-text)" strokeWidth="2.5" />
                <circle cx="180" cy="135" r="16" className="fill-accent/20 stroke-accent stroke-2" />
                <text x="180" y="140" textAnchor="middle" fontWeight="bold" fontSize="12" className="fill-text">
                  H
                </text>

                <text x="120" y="145" textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-accent">
                  104.5°
                </text>
              </g>
            )}

            {selectedId === "co2" && (
              <g>
                {/* Carbon center */}
                <circle cx="120" cy="90" r="20" className="fill-text/10 stroke-text stroke-2" />
                <text x="120" y="95" textAnchor="middle" fontWeight="bold" fontSize="14" className="fill-text">
                  C
                </text>
                {/* Double bonds */}
                <line x1="60" y1="86" x2="100" y2="86" stroke="var(--color-text)" strokeWidth="2" />
                <line x1="60" y1="94" x2="100" y2="94" stroke="var(--color-text)" strokeWidth="2" />

                <line x1="140" y1="86" x2="180" y2="86" stroke="var(--color-text)" strokeWidth="2" />
                <line x1="140" y1="94" x2="180" y2="94" stroke="var(--color-text)" strokeWidth="2" />

                {/* Left Oxygen */}
                <circle cx="45" cy="90" r="18" className="fill-danger/20 stroke-danger stroke-2" />
                <text x="45" y="95" textAnchor="middle" fontWeight="bold" fontSize="12" className="fill-text">
                  O
                </text>

                {/* Right Oxygen */}
                <circle cx="195" cy="90" r="18" className="fill-danger/20 stroke-danger stroke-2" />
                <text x="195" y="95" textAnchor="middle" fontWeight="bold" fontSize="12" className="fill-text">
                  O
                </text>

                <text x="120" y="130" textAnchor="middle" fontSize="11" fontWeight="bold" className="fill-accent">
                  180° (Linear)
                </text>
              </g>
            )}

            {selectedId === "ch4" && (
              <g>
                {/* Carbon center */}
                <circle cx="120" cy="90" r="22" className="fill-text/10 stroke-text stroke-2" />
                <text x="120" y="95" textAnchor="middle" fontWeight="bold" fontSize="14" className="fill-text">
                  C
                </text>
                {/* 4 Hydrogens */}
                <line x1="120" y1="68" x2="120" y2="35" stroke="var(--color-text)" strokeWidth="2" />
                <circle cx="120" cy="25" r="14" className="fill-accent/20 stroke-accent stroke-2" />
                <text x="120" y="29" textAnchor="middle" fontSize="11" fontWeight="bold" className="fill-text">H</text>

                <line x1="102" y1="104" x2="65" y2="135" stroke="var(--color-text)" strokeWidth="2" />
                <circle cx="55" cy="142" r="14" className="fill-accent/20 stroke-accent stroke-2" />
                <text x="55" y="146" textAnchor="middle" fontSize="11" fontWeight="bold" className="fill-text">H</text>

                <line x1="138" y1="104" x2="175" y2="135" stroke="var(--color-text)" strokeWidth="2" />
                <circle cx="185" cy="142" r="14" className="fill-accent/20 stroke-accent stroke-2" />
                <text x="185" y="146" textAnchor="middle" fontSize="11" fontWeight="bold" className="fill-text">H</text>

                <line x1="135" y1="78" x2="175" y2="65" stroke="var(--color-text)" strokeWidth="2" strokeDasharray="3 2" />
                <circle cx="188" cy="60" r="13" className="fill-accent/20 stroke-accent stroke-2" />
                <text x="188" y="64" textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-text">H</text>

                <text x="120" y="155" textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-accent">
                  109.5° (Tetrahedral)
                </text>
              </g>
            )}

            {selectedId === "nacl" && (
              <g>
                {/* Cation Na+ */}
                <circle cx="75" cy="90" r="26" className="fill-amber-500/20 stroke-amber-500 stroke-2" />
                <text x="75" y="95" textAnchor="middle" fontWeight="bold" fontSize="14" className="fill-text">
                  Na⁺
                </text>
                <text x="75" y="130" textAnchor="middle" fontSize="10" className="fill-text-muted font-mono">
                  [2, 8]
                </text>

                {/* Electrostatic interaction */}
                <path d="M 105 85 L 130 85 M 105 95 L 130 95" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="4 2" />

                {/* Anion Cl- */}
                <circle cx="165" cy="90" r="32" className="fill-emerald-500/20 stroke-emerald-500 stroke-2" />
                <text x="165" y="96" textAnchor="middle" fontWeight="bold" fontSize="14" className="fill-text">
                  Cl⁻
                </text>
                <text x="165" y="136" textAnchor="middle" fontSize="10" className="fill-text-muted font-mono">
                  [2, 8, 8]
                </text>

                <text x="120" y="160" textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-accent">
                  Gaya Elektrostatik Coulomb
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Bond Descriptor Ledger */}
        <div className="space-y-2.5 flex-1 text-xs">
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <span className="text-text-muted">Jenis Ikatan Kimia:</span>
              <span className="font-mono font-bold capitalize text-accent">{activeMol.type.replace("-", " ")}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <span className="text-text-muted">Bentuk Geometri Molekul:</span>
              <span className="font-mono font-bold text-text">{activeMol.geometry}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Sudut Ikatan Antar-Atom:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{activeMol.bondAngle}</span>
            </div>
          </div>

          <p className="text-text-muted p-2 bg-surface/50 rounded-lg border border-border-subtle text-[11px] leading-relaxed">
            {activeMol.description}
          </p>
        </div>
      </div>

      {/* Analytical Reasoning Card */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
        <div className="font-bold text-text text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Prinsip Pembentukan Ikatan &amp; Teori VSEPR:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-muted leading-relaxed">
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">1. Mengapa H₂O Memiliki Sudut 104.5° Bukan 180°?</span>
            <p>
              Oksigen memiliki 4 pasang elektron (2 ikatan dan 2 bebas/PEB). Pasangan elektron bebas menempati ruang lebih besar dan memberikan gaya tolak elektrostatik lebih kuat, menekan kedua ikatan O-H mendekat dari sudut ideal tetrahedral 109.5° menjadi 104.5°.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">2. Mengapa CO₂ Nonpolar Walau Ikatan C=O Polar?</span>
            <p>
              Meskipun ikatan C=O bersifat polar karena Oksigen lebih elektronegatif, molekul CO₂ berbentuk linear sempurna 180°. Dua vektor dipol yang sama besar saling menarik ke arah berlawanan, sehingga resultan dipol saling meniadakan (<MathRenderer inline content={`$\\mu = 0$`} />).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
