"use client";

import React, { useState } from "react";
import { Dna, Eye, Sparkles } from "lucide-react";

interface OrganelleInfo {
  name: string;
  role: string;
  presence: string;
}

const ORGANELLES: Record<string, OrganelleInfo> = {
  nukleus: {
    name: "Nukleus (Inti Sel)",
    role: "Menyimpan materi genetik (DNA/kromosom) dan mengatur seluruh ekspresi gen serta sintesis protein sel.",
    presence: "Ada pada Sel Hewan & Tumbuhan (Eukariotik). Prokariota hanya memiliki nukleoid tanpa membran.",
  },
  mitokondria: {
    name: "Mitokondria (Pabrik Energi)",
    role: "Pusat respirasi seluler yang mengubah glukosa dan oksigen menjadi mata uang energi kimiawi ATP.",
    presence: "Ada pada seluruh sel eukariotik aerob.",
  },
  kloroplas: {
    name: "Kloroplas (Situs Fotosintesis)",
    role: "Menangkap foton cahaya matahari menggunakan klorofil untuk mensintesis karbohidrat dari CO₂ dan air.",
    presence: "Eksklusif pada Sel Tumbuhan dan alga fotosintetik.",
  },
  membran: {
    name: "Membran Sel (Fosfolipid Bilayer)",
    role: "Barier semi-permeabel selektif yang mengatur keluar-masuknya zat dan menjaga homeostasis internal sel.",
    presence: "Ada pada SEMUA bentuk sel kehidupan (Hewan, Tumbuhan, Bakteri).",
  },
  dinding: {
    name: "Dinding Sel (Selulosa / Peptidoglikan)",
    role: "Struktur kaku di luar membran yang memberi perlindungan mekanik dan mempertahankan tekanan turgor sel.",
    presence: "Ada pada Sel Tumbuhan (selulosa) dan Bakteri, tidak ada pada Sel Hewan.",
  },
};

export function CellStructurePlayground() {
  const [cellType, setCellType] = useState<"animal" | "plant" | "bacteria">("animal");
  const [activeOrganelle, setActiveOrganelle] = useState<string>("nukleus");

  const info = ORGANELLES[activeOrganelle] ?? ORGANELLES.nukleus;

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <Dna className="w-4 h-4 text-accent" />
            <span>Laboratorium Struktur Sel: Prokariotik vs Eukariotik</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Inspeksi anatomi seluler mikroskopis untuk membuktikan bagaimana kompartementalisasi organel menopang kehidupan.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold capitalize">
            Tipe: {cellType === "animal" ? "Sel Hewan" : cellType === "plant" ? "Sel Tumbuhan" : "Bakteri (Prokariot)"}
          </span>
        </div>
      </div>

      {/* Cell Type Tabs */}
      <div className="flex gap-2">
        {[
          { id: "animal", label: "Sel Hewan (Eukariot)" },
          { id: "plant", label: "Sel Tumbuhan (Eukariot)" },
          { id: "bacteria", label: "Bakteri (Prokariot)" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setCellType(t.id as "animal" | "plant" | "bacteria")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              cellType === t.id
                ? "bg-accent text-surface-raised border-accent shadow-xs"
                : "bg-surface-raised border-border text-text hover:bg-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Interactive Microscopic Viewport & Organelle Clickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-surface-raised/50 p-4 rounded-xl border border-border">
        {/* Cell SVG Schematics */}
        <div className="flex flex-col items-center justify-center p-2">
          <svg
            viewBox="0 0 240 200"
            className="w-56 h-48 select-none"
            role="img"
            aria-label={`Skematis sel mikroskopis ${cellType}`}
          >
            {/* Plant Cell: Rectangular cell wall */}
            {cellType === "plant" && (
              <g>
                <rect x="20" y="20" width="200" height="160" rx="16" className="fill-emerald-500/10 stroke-emerald-600 stroke-4" />
                <rect x="28" y="28" width="184" height="144" rx="10" className="fill-emerald-500/5 stroke-emerald-500 stroke-2" />
                {/* Central vacuole */}
                <rect x="100" y="40" width="95" height="90" rx="12" className="fill-cyan-500/20 stroke-cyan-500 stroke-1" />
                <text x="145" y="88" textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">Vakuola</text>
                {/* Chloroplasts */}
                <ellipse cx="55" cy="50" rx="16" ry="10" className="fill-emerald-600/40 stroke-emerald-600 stroke-1.5" />
                <ellipse cx="65" cy="145" rx="16" ry="10" className="fill-emerald-600/40 stroke-emerald-600 stroke-1.5" />
                {/* Nucleus */}
                <circle cx="65" cy="95" r="22" className="fill-accent/20 stroke-accent stroke-2" />
                <circle cx="65" cy="95" r="7" className="fill-accent" />
              </g>
            )}

            {/* Animal Cell: Rounded flexible membrane */}
            {cellType === "animal" && (
              <g>
                <ellipse cx="120" cy="100" rx="95" ry="75" className="fill-amber-500/5 stroke-amber-500 stroke-2.5" />
                {/* Nucleus */}
                <circle cx="105" cy="95" r="28" className="fill-accent/20 stroke-accent stroke-2" />
                <circle cx="105" cy="95" r="9" className="fill-accent" />
                <text x="105" y="132" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--color-text)">Nukleus</text>
                {/* Mitochondria */}
                <ellipse cx="165" cy="70" rx="18" ry="9" transform="rotate(25 165 70)" className="fill-danger/30 stroke-danger stroke-1.5" />
                <ellipse cx="65" cy="135" rx="16" ry="8" transform="rotate(-30 65 135)" className="fill-danger/30 stroke-danger stroke-1.5" />
              </g>
            )}

            {/* Bacteria Cell: Capsule with flagellum */}
            {cellType === "bacteria" && (
              <g>
                <rect x="40" y="60" width="130" height="80" rx="40" className="fill-indigo-500/15 stroke-indigo-500 stroke-3" />
                {/* Nucleoid DNA loop (no membrane) */}
                <path d="M 75 95 Q 90 80 105 100 T 135 95" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeDasharray="3 2" />
                <text x="105" y="120" textAnchor="middle" fontSize="9" fill="var(--color-accent)" fontWeight="bold">Nukleoid Bebas</text>
                {/* Flagellum tail */}
                <path d="M 40 100 C 15 90 20 130 5 120" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}
          </svg>
        </div>

        {/* Organelle Inspector Buttons and Info Panel */}
        <div className="space-y-3 p-2 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(ORGANELLES).map((key) => {
              const o = ORGANELLES[key];
              const isSelected = activeOrganelle === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveOrganelle(key)}
                  className={`px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    isSelected
                      ? "bg-accent text-surface-raised border-accent shadow-xs font-bold"
                      : "bg-surface border-border text-text hover:bg-surface-raised"
                  }`}
                >
                  {o.name.split(" ")[0]}
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
            <h5 className="font-bold text-sm text-text flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-accent" />
              <span>{info.name}</span>
            </h5>
            <p className="text-text-muted leading-relaxed">
              <strong>Fungsi Biologis:</strong> {info.role}
            </p>
            <div className="text-[11px] p-2 rounded bg-surface-raised border border-border-subtle text-accent font-medium">
              {info.presence}
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Reasoning Card */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
        <div className="font-bold text-text text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Prinsip Teori Sel &amp; Evolusi Kompartementalisasi:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-muted leading-relaxed">
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">1. Perbedaan Mendasar Prokariot vs Eukariot:</span>
            <p>
              Kata <em>prokariot</em> berarti &quot;sebelum inti&quot; (materi genetik mengapung bebas di sitoplasma), sedangkan <em>eukariot</em> memiliki membran inti dan organel bermembran, memungkinkan reaksi kimia spesifik berlangsung terisolasi tanpa saling mengganggu.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">2. Mengapa Tumbuhan Memerlukan Dinding Sel &amp; Vakuola?</span>
            <p>
              Berbeda dengan hewan yang dapat bergerak mencari makan atau berlindung, tumbuhan berdiri statis. Tekanan hidrostatik cairan di dalam vakuola besar mendorong dinding sel kaku (tekanan turgor), menjaga batang dan daun tetap tegak kokoh melawan gravitasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
